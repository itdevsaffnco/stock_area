<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\API\StoreController;
use App\Http\Controllers\API\ProductController;
use App\Http\Controllers\API\StockController;
use App\Http\Controllers\API\StockTypeController;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Master Data
    Route::get('/stores', [StoreController::class, 'index']);
    Route::post('/stores', [StoreController::class, 'store']);
    Route::put('/stores/{id}', [StoreController::class, 'update']);
    Route::delete('/stores/{id}', [StoreController::class, 'destroy']);
    Route::get('/stock-types', [StockTypeController::class, 'index']);
    Route::post('/stock-types', [StockTypeController::class, 'store']);
    Route::put('/stock-types/{id}', [StockTypeController::class, 'update']);
    Route::delete('/stock-types/{id}', [StockTypeController::class, 'destroy']);
    Route::get('/products', [ProductController::class, 'index']);
    Route::post('/products', [ProductController::class, 'store']);
    Route::put('/products/{id}', [ProductController::class, 'update']);
    Route::delete('/products/{id}', [ProductController::class, 'destroy']);

    // Stock
    Route::get('/stocks', [StockController::class, 'index']); // Admin View
    Route::post('/stocks', [StockController::class, 'store']); // Staff Input
    Route::get('/stocks/current', [StockController::class, 'current']); // Check current stock
    Route::get('/stocks/opname-template', [StockController::class, 'downloadOpnameTemplate']); // Download Opname Template
    Route::put('/stocks/{id}/approve', [StockController::class, 'approve']);
    Route::put('/stocks/{id}/tracking', [StockController::class, 'updateTracking']);

    // User Management
    Route::get('/users', [AuthController::class, 'index']);
    Route::post('/users', [AuthController::class, 'register']);
});
