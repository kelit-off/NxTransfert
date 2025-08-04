<?php

namespace App\Http\Controllers;

use App\Models\Idee;
use Illuminate\Http\Request;

class IdeeController extends Controller
{
    public function store(Request $request) {
        $request->validate([
            'contenue' => 'required|string|max:2000',
        ]);

        $idee = Idee::create([
            'contenue' => $request->contenue
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Idee enregistrée avec succès',
            'idee' =>$idee
        ]);
    }
}
