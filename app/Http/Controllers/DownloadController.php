<?php

namespace App\Http\Controllers;

use App\Models\Transfer;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DownloadController extends Controller
{
    public function DownloadPage($token) {
        $TransferInfo = Transfer::where('token', $token)->firstOrFail();

        return Inertia::render('download', [
            "files" => $TransferInfo->files,
            "token" => $token
        ]);
    }
}
