<?php

namespace App\Http\Controllers;

use App\Models\Transfer;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use ZipArchive;

class UploadController extends Controller
{
    public function UploadPage()
    {
        return Inertia::render("upload");
    }

    /**
     * Upload d'un gros fichier vers S3 en utilisant le multipart upload
     */
    private function uploadLargeFile($filePath, $s3Key)
    {
        try {
            $s3Client = Storage::disk('s3')->getAdapter()->getClient();
            $bucket = config('filesystems.disks.s3.bucket');
            
            Log::info('Début du multipart upload pour: ' . $s3Key);
            
            // Initier le multipart upload
            $result = $s3Client->createMultipartUpload([
                'Bucket' => $bucket,
                'Key' => $s3Key,
            ]);
            
            $uploadId = $result['UploadId'];
            Log::info('Multipart upload ID: ' . $uploadId);
            
            // Lire le fichier par chunks de 5MB
            $chunkSize = 5 * 1024 * 1024; // 5MB
            $file = fopen($filePath, 'r');
            $parts = [];
            $partNumber = 1;
            
            while (!feof($file)) {
                $chunk = fread($file, $chunkSize);
                
                if (strlen($chunk) === 0) {
                    break;
                }
                
                Log::info('Upload de la partie ' . $partNumber . ' (' . strlen($chunk) . ' bytes)');
                
                $partResult = $s3Client->uploadPart([
                    'Bucket' => $bucket,
                    'Key' => $s3Key,
                    'UploadId' => $uploadId,
                    'PartNumber' => $partNumber,
                    'Body' => $chunk,
                ]);
                
                $parts[] = [
                    'ETag' => $partResult['ETag'],
                    'PartNumber' => $partNumber,
                ];
                
                $partNumber++;
            }
            
            fclose($file);
            
            // Finaliser le multipart upload
            Log::info('Finalisation du multipart upload avec ' . count($parts) . ' parties');
            
            $s3Client->completeMultipartUpload([
                'Bucket' => $bucket,
                'Key' => $s3Key,
                'UploadId' => $uploadId,
                'MultipartUpload' => [
                    'Parts' => $parts,
                ],
            ]);
            
            Log::info('Multipart upload terminé avec succès');
            return true;
            
        } catch (\Exception $e) {
            Log::error('Erreur multipart upload: ' . $e->getMessage());
            
            // Nettoyer en cas d'erreur
            if (isset($uploadId)) {
                try {
                    $s3Client->abortMultipartUpload([
                        'Bucket' => $bucket,
                        'Key' => $s3Key,
                        'UploadId' => $uploadId,
                    ]);
                } catch (\Exception $cleanupError) {
                    Log::error('Erreur cleanup multipart: ' . $cleanupError->getMessage());
                }
            }
            
            return false;
        }
    }

    public function UploadPost(Request $request)
    {
        // Log de début pour vérifier que la méthode est appelée
        Log::info('=== DEBUT UPLOAD ===');
        Log::info('Nombre de fichiers reçus: ' . count($request->file('files', [])));

        try {
            $request->validate([
                'message' => 'nullable|string',
                'files' => 'required|array',
                'files.*' => 'file|max:51200',
            ]);

            Log::info('Validation réussie');

            $expiration_date = now()->addDay(14)->format('Y-m-d H:i:s');
            $token = Str::uuid();

            $zip = new ZipArchive();
            $tempZipPath = sys_get_temp_dir() . '/' . $token . '.zip';

            Log::info('Chemin ZIP temporaire: ' . $tempZipPath);

            if ($zip->open($tempZipPath, ZipArchive::CREATE) !== true) {
                Log::error('Impossible de créer le fichier ZIP à: ' . $tempZipPath);
                return response()->json(['error' => 'Impossible de créer le fichier ZIP'], 500);
            }

            $filesList = [];
            foreach ($request->file('files') as $index => $file) {
                Log::info("--- Traitement fichier $index ---");
                Log::info('Fichier reçu : ' . $file->getClientOriginalName());
                Log::info('Mime type : ' . $file->getMimeType());
                Log::info('Taille : ' . $file->getSize());
                Log::info('Chemin réel : ' . $file->getRealPath());
                Log::info('Chemin temporaire : ' . $file->getPathname());
                Log::info('Extension : ' . $file->getClientOriginalExtension());

                if (!$file->isValid()) {
                    Log::error("Fichier mal uploadé: " . $file->getClientOriginalName());
                    continue;
                }

                $originalName = $file->getClientOriginalName();
                $safeName = Str::slug(pathinfo($originalName, PATHINFO_FILENAME))
                    . '.' . $file->getClientOriginalExtension();

                Log::info('Nom sécurisé: ' . $safeName);

                // CORRECTION: Utiliser addFromString au lieu de addFile
                $fileContent = file_get_contents($file->getRealPath());
                
                if ($fileContent === false) {
                    Log::error("Impossible de lire le fichier: " . $file->getClientOriginalName());
                    continue;
                }

                $addResult = $zip->addFromString($safeName, $fileContent);
                
                if (!$addResult) {
                    Log::error("Impossible d'ajouter le fichier au ZIP: " . $safeName);
                    continue;
                }

                Log::info('Fichier ajouté au ZIP avec succès: ' . $safeName);

                $filesList[] = [
                    'name' => $safeName,
                    'size' => $file->getSize()
                ];
            }

            Log::info('Nombre de fichiers dans le ZIP: ' . count($filesList));

            $closeResult = $zip->close();
            Log::info('ZIP fermé: ' . ($closeResult ? 'succès' : 'échec'));

            if (!$closeResult) {
                Log::error('Erreur lors de la fermeture du ZIP');
                return response()->json(['error' => 'Erreur lors de la création du ZIP'], 500);
            }

            // Vérifier que le fichier ZIP existe et n'est pas vide
            if (!file_exists($tempZipPath) || filesize($tempZipPath) === 0) {
                Log::error('Le fichier ZIP est vide ou n\'existe pas');
                return response()->json(['error' => 'Le fichier ZIP est invalide'], 500);
            }

            Log::info('Taille du ZIP créé: ' . filesize($tempZipPath) . ' bytes');

            $zipContents = file_get_contents($tempZipPath);

            if ($zipContents === false) {
                Log::error('Impossible de lire le contenu du fichier ZIP');
                return response()->json(['error' => 'Erreur lors de la lecture du ZIP'], 500);
            }

            Log::info('Upload vers S3...');
            Log::info('Nom du fichier S3: ' . $token . ".zip");
            Log::info('Taille du contenu à uploader: ' . strlen($zipContents) . ' bytes');
            
            try {
                $s3Result = Storage::disk("s3")->put($token . ".zip", $zipContents);
                Log::info('Résultat S3 put: ' . ($s3Result ? 'true' : 'false'));
                
                if (!$s3Result) {
                    Log::error('Storage::put a retourné false');
                    return response()->json(['error' => 'Erreur lors de l\'upload vers S3'], 500);
                }
                
                // Vérifier que le fichier existe sur S3
                $exists = Storage::disk("s3")->exists($token . ".zip");
                Log::info('Fichier existe sur S3: ' . ($exists ? 'oui' : 'non'));
                
                if (!$exists) {
                    Log::error('Le fichier n\'existe pas sur S3 après upload');
                    return response()->json(['error' => 'Fichier non trouvé sur S3 après upload'], 500);
                }
                
            } catch (\Exception $s3Exception) {
                Log::error('Exception S3: ' . $s3Exception->getMessage());
                Log::error('S3 Stack trace: ' . $s3Exception->getTraceAsString());
                return response()->json(['error' => 'Erreur S3: ' . $s3Exception->getMessage()], 500);
            }

            Log::info('Upload S3 réussi');

            // Nettoyer le fichier temporaire
            if (file_exists($tempZipPath)) {
                unlink($tempZipPath);
                Log::info('Fichier temporaire supprimé');
            }

            $transfert = Transfer::create([
                'token' => $token,
                'message' => $request->message,
                'expire_at' => $expiration_date,
                'files' => $filesList
            ]);

            Log::info('Transfer créé en base avec ID: ' . $transfert->id);
            Log::info('=== FIN UPLOAD SUCCESS ===');

            return response()->json([
                "status" => "success",
                "url" => config("app.url") . "/d/" . $token,
                "date_expiration" => $expiration_date
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Erreur de validation: ' . json_encode($e->errors()));
            return response()->json([
                'error' => 'Erreur de validation',
                'details' => $e->errors()
            ], 422);

        } catch (\Exception $e) {
            Log::error('ERREUR GÉNÉRALE UPLOAD: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'error' => 'Erreur serveur: ' . $e->getMessage()
            ], 500);
        }
    }
}