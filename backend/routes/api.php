<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BranchController;
use App\Http\Controllers\Api\BrandController;
use App\Http\Controllers\Api\CashTransactionController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\PermissionController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\PurchaseController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\SaleController;
use App\Http\Controllers\Api\SettingController;
use App\Http\Controllers\Api\ShiftController;
use App\Http\Controllers\Api\StockMovementController;
use App\Http\Controllers\Api\SupplierController;
use App\Http\Controllers\Api\UnitController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\WarehouseController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::post('/auth/login', [AuthController::class, 'login'])
        ->middleware('throttle:login');
    Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword'])
        ->middleware('throttle:login');
    Route::post('/auth/reset-password', [AuthController::class, 'resetPassword']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::get('/auth/me', [AuthController::class, 'me']);
        Route::put('/auth/profile', [AuthController::class, 'updateProfile']);
        Route::put('/auth/change-password', [AuthController::class, 'changePassword']);

        Route::get('/settings', [SettingController::class, 'index']);
        Route::put('/settings', [SettingController::class, 'update']);

        Route::get('/dashboard', [DashboardController::class, 'index']);

        Route::get('/categories', [CategoryController::class, 'index']);
        Route::get('/categories/{category}', [CategoryController::class, 'show']);
        Route::middleware('can:manage-products')->group(function () {
            Route::post('/categories', [CategoryController::class, 'store']);
            Route::put('/categories/{category}', [CategoryController::class, 'update']);
            Route::delete('/categories/{category}', [CategoryController::class, 'destroy']);
        });

        Route::get('/brands', [BrandController::class, 'index']);
        Route::get('/brands/{brand}', [BrandController::class, 'show']);
        Route::middleware('can:manage-products')->group(function () {
            Route::post('/brands', [BrandController::class, 'store']);
            Route::put('/brands/{brand}', [BrandController::class, 'update']);
            Route::delete('/brands/{brand}', [BrandController::class, 'destroy']);
        });

        Route::get('/units', [UnitController::class, 'index']);
        Route::get('/units/{unit}', [UnitController::class, 'show']);
        Route::middleware('can:manage-products')->group(function () {
            Route::post('/units', [UnitController::class, 'store']);
            Route::put('/units/{unit}', [UnitController::class, 'update']);
            Route::delete('/units/{unit}', [UnitController::class, 'destroy']);
        });

        Route::get('/products', [ProductController::class, 'index']);
        Route::get('/products/{product}', [ProductController::class, 'show']);
        Route::middleware('can:manage-products')->group(function () {
            Route::post('/products', [ProductController::class, 'store']);
            Route::put('/products/{product}', [ProductController::class, 'update']);
            Route::delete('/products/{product}', [ProductController::class, 'destroy']);
        });

        Route::get('/sales', [SaleController::class, 'index']);
        Route::get('/sales/{sale}', [SaleController::class, 'show']);
        Route::middleware('can:manage-sales')->group(function () {
            Route::post('/sales', [SaleController::class, 'store']);
            Route::post('/sales/{sale}/refund', [SaleController::class, 'refund']);
        });

        Route::get('/customers', [CustomerController::class, 'index']);
        Route::get('/customers/{customer}', [CustomerController::class, 'show']);
        Route::middleware('can:manage-customers')->group(function () {
            Route::post('/customers', [CustomerController::class, 'store']);
            Route::put('/customers/{customer}', [CustomerController::class, 'update']);
            Route::delete('/customers/{customer}', [CustomerController::class, 'destroy']);
        });

        Route::get('/suppliers', [SupplierController::class, 'index']);
        Route::get('/suppliers/{supplier}', [SupplierController::class, 'show']);
        Route::middleware('can:manage-suppliers')->group(function () {
            Route::post('/suppliers', [SupplierController::class, 'store']);
            Route::put('/suppliers/{supplier}', [SupplierController::class, 'update']);
            Route::delete('/suppliers/{supplier}', [SupplierController::class, 'destroy']);
        });

        Route::get('/purchases', [PurchaseController::class, 'index']);
        Route::get('/purchases/{purchase}', [PurchaseController::class, 'show']);
        Route::middleware('can:manage-purchases')->group(function () {
            Route::post('/purchases', [PurchaseController::class, 'store']);
            Route::put('/purchases/{purchase}', [PurchaseController::class, 'update']);
            Route::delete('/purchases/{purchase}', [PurchaseController::class, 'destroy']);
            Route::post('/purchases/{purchase}/receive', [PurchaseController::class, 'receive']);
            Route::post('/purchases/{purchase}/cancel', [PurchaseController::class, 'cancel']);
            Route::post('/purchases/{purchase}/pay', [PurchaseController::class, 'pay']);
        });

        Route::get('/stock-movements', [StockMovementController::class, 'index']);
        Route::get('/stock-movements/{stock_movement}', [StockMovementController::class, 'show']);
        Route::middleware('can:manage-inventory')->group(function () {
            Route::post('/stock-movements', [StockMovementController::class, 'store']);
        });

        Route::middleware('can:operate-cash-drawer')->group(function () {
            Route::get('/shifts', [ShiftController::class, 'index']);
            Route::post('/shifts', [ShiftController::class, 'store']);
            Route::get('/shifts/current', [ShiftController::class, 'current']);
            Route::get('/shifts/{shift}', [ShiftController::class, 'show']);
            Route::post('/shifts/{shift}/close', [ShiftController::class, 'close']);

            Route::get('/cash-transactions', [CashTransactionController::class, 'index']);
            Route::post('/cash-transactions', [CashTransactionController::class, 'store']);
        });

        Route::middleware('can:view-reports')->prefix('reports')->group(function () {
            Route::get('/sales', [ReportController::class, 'sales']);
            Route::get('/purchases', [ReportController::class, 'purchases']);
            Route::get('/inventory', [ReportController::class, 'inventory']);
            Route::get('/profit', [ReportController::class, 'profit']);
            Route::get('/tax', [ReportController::class, 'tax']);
            Route::get('/customers', [ReportController::class, 'customers']);
            Route::get('/suppliers', [ReportController::class, 'suppliers']);
            Route::get('/best-selling', [ReportController::class, 'bestSelling']);
            Route::get('/stock-movements', [ReportController::class, 'stockMovements']);
        });

        Route::get('/branches', [BranchController::class, 'index']);
        Route::get('/branches/{branch}', [BranchController::class, 'show']);
        Route::middleware('can:manage-settings')->group(function () {
            Route::post('/branches', [BranchController::class, 'store']);
            Route::put('/branches/{branch}', [BranchController::class, 'update']);
            Route::delete('/branches/{branch}', [BranchController::class, 'destroy']);
        });

        Route::get('/warehouses', [WarehouseController::class, 'index']);
        Route::get('/warehouses/{warehouse}', [WarehouseController::class, 'show']);
        Route::middleware('can:manage-settings')->group(function () {
            Route::post('/warehouses', [WarehouseController::class, 'store']);
            Route::put('/warehouses/{warehouse}', [WarehouseController::class, 'update']);
            Route::delete('/warehouses/{warehouse}', [WarehouseController::class, 'destroy']);
        });

        Route::middleware('can:manage-users')->group(function () {
            Route::get('/users', [UserController::class, 'index']);
            Route::post('/users', [UserController::class, 'store']);
            Route::get('/users/{user}', [UserController::class, 'show']);
            Route::put('/users/{user}', [UserController::class, 'update']);
            Route::delete('/users/{user}', [UserController::class, 'destroy']);

            Route::get('/roles', [RoleController::class, 'index']);
            Route::post('/roles', [RoleController::class, 'store']);
            Route::get('/roles/{role}', [RoleController::class, 'show']);
            Route::put('/roles/{role}', [RoleController::class, 'update']);
            Route::delete('/roles/{role}', [RoleController::class, 'destroy']);

            Route::get('/permissions', [PermissionController::class, 'index']);
            Route::post('/permissions', [PermissionController::class, 'store']);
            Route::get('/permissions/{permission}', [PermissionController::class, 'show']);
            Route::put('/permissions/{permission}', [PermissionController::class, 'update']);
            Route::delete('/permissions/{permission}', [PermissionController::class, 'destroy']);
        });
    });
});
