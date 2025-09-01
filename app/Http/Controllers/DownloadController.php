<?php

namespace App\Http\Controllers;

use App\Models\Transfer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class DownloadController extends Controller
{
    public function DownloadPage($token)
    {
        $TransferInfo = Transfer::where('token', $token)->firstOrFail();

        return Inertia::render('download', [
            "files" => $TransferInfo->files,
            'message' => $TransferInfo->message,
            "token" => $token
        ]);
    }

    public function DownloadPost(Request $request)
    {
        $request->validate([
            "token" => "required|uuid"
        ]);

        $transfer = Transfer::where('token', $request->token)->firstOrFail();
        $fileName = $request->token . ".zip";

        // Vérifier que le fichier existe sur S3
        if (!Storage::disk('s3')->exists($fileName)) {
            return response()->json(['status' => 'error', 'message' => 'File not found'], 404);
        }

        // Chemin temporaire local
        $localPath = storage_path('app/temp/' . $fileName);
        if (!file_exists(dirname($localPath))) {
            mkdir(dirname($localPath), 0755, true);
        }

        // Copier le fichier S3 vers le local (en streaming pour ne pas saturer la RAM)
        $stream = Storage::disk('s3')->readStream($fileName);
        $out = fopen($localPath, 'w');
        stream_copy_to_stream($stream, $out);
        fclose($out);

        // Générer une URL de téléchargement Laravel
        $downloadUrl = url('/dd/' . $request->token); //route('download.temp', ['file' => $fileName]);

        return response()->json([
            'status' => 'success',
            'download_url' => $downloadUrl
        ]);
    }

    public function downloadZip($token)
    {
        $fileName = $token . '.zip';
        $localPath = storage_path('app/temp/' . $fileName);

        if (!file_exists(dirname($localPath))) {
            mkdir(dirname($localPath), 0755, true);
        }

        // Copier depuis S3 uniquement si le fichier local n’existe pas
        if (!file_exists($localPath)) {
            if (!Storage::disk('s3')->exists($fileName)) {
                abort(404, 'Fichier non disponible sur le site.');
            }

            $stream = Storage::disk('s3')->readStream($fileName);
            $out = fopen($localPath, 'w');
            stream_copy_to_stream($stream, $out);
            fclose($out);
        }

        // Télécharger et supprimer après envoi
        return response()->download($localPath, 'archive_' . date('Y-m-d') . '.zip')
            ->deleteFileAfterSend(true);
    }
}
