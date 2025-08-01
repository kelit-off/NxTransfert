<?php

namespace App\Http\Controllers;

use App\Models\Transfer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class DownloadController extends Controller
{
    public function DownloadPage($token) {
        $TransferInfo = Transfer::where('token', $token)->firstOrFail();

        return Inertia::render('download', [
            "files" => $TransferInfo->files,
            'message' => $TransferInfo->message,
            "token" => $token
        ]);
    }

    public function DownloadPost(Request $request) {
        $request->validate([
            "token" => "required|uuid"
        ]);

        $transfer = Transfer::where('token', $request->token)->firstOrFail();

        $url = Storage::disk("s3")->temporaryUrl(
            $request->token.".zip",
            now()->addMinutes(10),
            ['ResponseContentDisposition' => 'attachment; filename="archive_'.date('Y-m-d').'.zip"']
        );

        return response()->json([
            'status' => "success",
            'download_url' => $url
        ]);
    }
}
