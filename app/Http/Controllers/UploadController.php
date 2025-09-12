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
            $s3Result = Storage::disk("s3")->put($token . ".zip", $zipContents);

            if (!$s3Result) {
                Log::error('Échec de l\'upload vers S3');
                return response()->json(['error' => 'Erreur lors de l\'upload vers S3'], 500);
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
