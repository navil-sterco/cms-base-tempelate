<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\PasswordResetLinkController;

Route::prefix('auth')->group(function() {
    Route::post('/register', [RegisterController::class, 'store']);
    Route::post('/login', [LoginController::class, 'login']);
    Route::post('/logout', [LoginController::class, 'logout'])->middleware('auth:sanctum');
    Route::post('/forgot-password', [PasswordResetLinkController::class, 'store']);
});

Route::middleware('auth:sanctum')->group(function () {
    
});