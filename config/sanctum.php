<?php

use Laravel\Sanctum\Sanctum;

return [

    /*
    |--------------------------------------------------------------------------
    | Dominios con Estado
    |--------------------------------------------------------------------------
    |
    | Las solicitudes de los siguientes dominios / hosts recibirán cookies de
    | autenticación de API con estado. Normalmente, estas deberían incluir sus dominios
    | locales y de producción que acceden a su API a través de una SPA frontend.
    |
    */

    'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', sprintf(
        '%s%s',
        'localhost,localhost:3000,127.0.0.1,127.0.0.1:8000,::1',
        Sanctum::currentApplicationUrlWithPort(),
        // Sanctum::currentRequestHost(),
    ))),

    /*
    |--------------------------------------------------------------------------
    | Guardias de Sanctum
    |--------------------------------------------------------------------------
    |
    | Este array contiene los guardias de autenticación que se comprobarán cuando
    | Sanctum intente autenticar una solicitud. Si ninguno de estos guardias
    | puede autenticar la solicitud, Sanctum utilizará el token portador
    | que está presente en una solicitud entrante para la autenticación.
    |
    */

    'guard' => ['web'],

    /*
    |--------------------------------------------------------------------------
    | Minutos de Expiración
    |--------------------------------------------------------------------------
    |
    | Este valor controla la cantidad de minutos hasta que un token emitido sea
    | considerado expirado. Esto anulará cualquier valor establecido en el atributo
    | "expires_at" del token, pero las sesiones de primera parte no se ven afectadas.
    |
    */

    'expiration' => env('SANCTUM_TOKEN_EXPIRATION', 1440),

    /*
    |--------------------------------------------------------------------------
    | Prefijo del Token
    |--------------------------------------------------------------------------
    |
    | Sanctum puede prefijar nuevos tokens para aprovechar las numerosas
    | iniciativas de escaneo de seguridad mantenidas por plataformas de código abierto
    | que notifican a los desarrolladores si confirman tokens en repositorios.
    |
    | Consulte: https://docs.github.com/en/code-security/secret-scanning/about-secret-scanning
    |
    */

    'token_prefix' => env('SANCTUM_TOKEN_PREFIX', ''),

    /*
    |--------------------------------------------------------------------------
    | Middleware de Sanctum
    |--------------------------------------------------------------------------
    |
    | Al autenticar su SPA de primera parte con Sanctum, es posible que deba
    | personalizar algunos de los middleware que utiliza Sanctum mientras procesa
    | la solicitud. Puede cambiar el middleware enumerado a continuación según sea necesario.
    |
    */

    'middleware' => [
        'authenticate_session' => Laravel\Sanctum\Http\Middleware\AuthenticateSession::class,
        'encrypt_cookies' => Illuminate\Cookie\Middleware\EncryptCookies::class,
        'validate_csrf_token' => Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class,
    ],

];
