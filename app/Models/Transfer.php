<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Transfer extends Model
{   
    protected $fillable = [
        "token",
        "files",
        "message",
        "expire_at"
    ];

    protected $casts = [
        'files' => 'array'
    ];
}
