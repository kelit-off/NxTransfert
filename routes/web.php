<?php

use App\Http\Controllers\DownloadController;
use App\Http\Controllers\UploadController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

Route::get('/', [UploadController::class, "UploadPage"])->name('home');

Route::get('/d/{token}', [DownloadController::class, 'DownloadPage']);
Route::get('/dd/{token}', [DownloadController::class, 'downloadZip']);

// Route::middleware(['auth', 'verified'])->group(function () {
//     Route::get('dashboard', function () {
//         return Inertia::render('dashboard');
//     })->name('dashboard');
// });

Route::prefix('admin')->group(function() {
    require __DIR__ . '/admin.php';
});

Route::get('/test-s3', function() {
    try {
        // Test simple
        $result = Storage::disk('s3')->put('test.txt', 'Hello World');
        
        if ($result) {
            $exists = Storage::disk('s3')->exists('test.txt');
            return "Upload: OK, Exists: " . ($exists ? 'OK' : 'FAIL');
        } else {
            return "Upload: FAIL";
        }
        
    } catch (\Exception $e) {
        return "Error: " . $e->getMessage();
    }
});