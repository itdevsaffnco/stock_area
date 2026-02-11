<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\URL;
use Illuminate\Pagination\Paginator;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register()
    {
        // Tempat untuk register service khusus bila diperlukan
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Paksa Laravel generate URL dengan HTTPS jika bukan local environment
        if (config('app.env') !== 'local') {
            URL::forceScheme('https');
        }

        // Gunakan Bootstrap 5 untuk pagination
        Paginator::useBootstrapFive();
    }
}
