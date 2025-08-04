<?php

use App\Http\Controllers\DownloadController;
use App\Http\Controllers\IdeeController;
use App\Http\Controllers\UploadController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::post("/upload", [UploadController::class, "UploadPost"]);
Route::post('/download', [DownloadController::class, "DownloadPost"]);

Route::post('/idee', [IdeeController::class, "store"]);
