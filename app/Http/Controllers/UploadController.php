<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class UploadController extends Controller
{
    public function UploadPage() {
        return Inertia::render("upload");
    }

    public function UploadPost(Request $request) {
        
    }
}
