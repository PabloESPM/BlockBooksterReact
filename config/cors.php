<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Configuración del Intercambio de Recursos de Origen Cruzado (CORS)
    |--------------------------------------------------------------------------
    |
    | Aquí puede configurar sus ajustes para el intercambio de recursos de origen cruzado
    | o "CORS". Esto determina qué operaciones de origen cruzado se pueden ejecutar
    | en los navegadores web. Es libre de ajustar estos ajustes según sea necesario.
    |
    | To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [env('APP_URL', 'http://localhost:8001')],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    // HAL-SEC-10: 3600s para que el navegador cachee la respuesta preflight OPTIONS durante 1 hora
    'max_age' => 3600,


    'supports_credentials' => true,

];
