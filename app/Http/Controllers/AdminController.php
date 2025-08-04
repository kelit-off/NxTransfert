<?php

namespace App\Http\Controllers;

use App\Models\Transfer;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminController extends Controller
{
    public function dashboard() {
        return Inertia::render("admin/dashboard", [
            "statsTrasnfertNonExpire" => count(Transfer::all())
        ]);
    }
}
