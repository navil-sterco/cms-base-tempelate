<?php

use App\Models\Page;
use Inertia\Inertia;
use Illuminate\Support\Facades\Route;
use Illuminate\Foundation\Application;
use App\Http\Controllers\PageController;
use App\Http\Controllers\ImageController;
use App\Http\Controllers\DegreeController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PageSectionController;
use App\Http\Controllers\SectionBuilderController;
use App\Http\Controllers\Frontend\FrontendController;

Route::get('/', function () {
    return redirect('modular/home');
});

Route::get('/admin', function () {
    if (auth()->check()) {
        return redirect()->route('dashboard');
    }

    return redirect()->route('admin.login');
});

Route::get('admin/login', function () {
    return Inertia::render('Auth/Login', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
})->name('admin.login');

Route::prefix('admin')->middleware('auth')->group(function () {
    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    //Profile  
    Route::prefix('profile')->group(function () {
        Route::get('/', [ProfileController::class, 'edit'])->name('profile.edit');
        Route::patch('/', [ProfileController::class, 'update'])->name('profile.update');
        Route::delete('/', [ProfileController::class, 'destroy'])->name('profile.destroy');
    });

    //Degree
    Route::resource('degree', DegreeController::class)->except(['destroy']);
    Route::prefix('degree')->group(function () {
        Route::get('/{degree}/destroy', [DegreeController::class, 'destroy'])->name('degree.destroy');
        Route::post('/{id}/toggle-status', [DegreeController::class, 'toggleStatus'])->name('degree.toggleStatus');
        Route::get('/{degree}/mapping', [DegreeController::class, 'mapping'])->name('degree.mapping');
        Route::post('{id}/mapping', [DegreeController::class, 'attachMapping'])->name('degree.mapping.attach');
    });

    // Page Sections Routes
    Route::resource('page-sections', PageSectionController::class);
    Route::put('/page-sections/{pageSection}/toggle-status', [PageSectionController::class, 'toggleStatus'])->name('page-sections.toggle-status');

    // Sections
    Route::get('/pages/{page}/sections', [SectionBuilderController::class, 'sections'])->name('pages.sections');
    Route::post('/pages/{page}/sections', [SectionBuilderController::class, 'storeSections'])->name('pages.sections.store');
    Route::get('/pages-section/{id}', [SectionBuilderController::class, 'destroySection'])->name('pages.sections.destroy');

    // Pages Routes
    Route::resource('pages', PageController::class);
    Route::put('/pages/{page}/toggle-publish', [PageController::class, 'togglePublish'])->name('pages.toggle-publish');
    Route::get('/pages/{pageId}/sections', [SectionBuilderController::class, 'create'])->name('pages.sections.create');

    Route::resource('images', ImageController::class)->except(['destroy','edit','update']);
    Route::get('/{image}/destroy', [ImageController::class, 'destroy'])->name('images.destroy');
});

    // Frontend route
    Route::get('pages/{slug}', [FrontendController::class, 'cmsPages'])->name('pages.frontend.show');
    Route::get('/modular/{slug}', [FrontendController::class, 'modularPages'])->name('pages.frontend.modular.show');

require __DIR__.'/auth.php';
