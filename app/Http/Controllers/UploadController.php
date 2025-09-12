<?php

namespace App\Http\Controllers;

use App\Models\Transfer;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
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
        $request->validate([
            'message' => 'nullable|string',
            'files' => 'required|array',
        ]);

        $expiration_date = now()->addDay(14)->format('Y-m-d H:i:s');
        $token = Str::uuid();

        $zip = new ZipArchive();
        $tempZipPath = sys_get_temp_dir() . '/' . $token . '.zip';

        if ($zip->open($tempZipPath, ZipArchive::CREATE) !== true) {
            return response()->json(['error' => 'Impossible de créer le fichier ZIP'], 500);
        }

        $filesList = [];
        foreach ($request->file('files') as $file) {
            if (!$file->isValid()) {
                continue;
            }
            $originalName = $file->getClientOriginalName();
            $safeName = Str::slug(pathinfo($originalName, PATHINFO_FILENAME))
                . '.' . $file->getClientOriginalExtension();

            $zip->addFile($file->getRealPath(), $safeName);

            $filesList[] = [
                'name' => $safeName,
                'size' => $file->getSize()
            ];
        }

        $zip->close();


        $zipContents = file_get_contents($tempZipPath);

        Storage::disk("s3")->put($token . ".zip", $zipContents);

        unlink($tempZipPath);

        $transfert = Transfer::create([
            'token' => $token,
            'message' => $request->message,
            'expire_at' => $expiration_date,
            'files' => $filesList
        ]);

        return response()->json([
            "status" => "success",
            "url" => config("app.url") . "/d/" . $token,
            "date_expiration" => $expiration_date
        ]);
    }
}
