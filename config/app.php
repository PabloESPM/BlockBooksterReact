<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Nombre de la Aplicación
    |--------------------------------------------------------------------------
    |
    | Este valor es el nombre de su aplicación, que se utilizará cuando el
    | framework necesite colocar el nombre de la aplicación en una notificación u
    | otros elementos de la interfaz de usuario donde deba mostrarse un nombre de aplicación.
    |
    */

    'name' => env('APP_NAME', 'Laravel'),

    /*
    |--------------------------------------------------------------------------
    | Entorno de la Aplicación
    |--------------------------------------------------------------------------
    |
    | Este valor determina el "entorno" en el que se ejecuta actualmente su
    | aplicación. Esto puede determinar cómo prefiere configurar varios
    | servicios que utiliza la aplicación. Establezca esto en su archivo ".env".
    |
    */

    'env' => env('APP_ENV', 'production'),

    /*
    |--------------------------------------------------------------------------
    | Modo de Depuración de la Aplicación
    |--------------------------------------------------------------------------
    |
    | Cuando su aplicación está en modo de depuración, se mostrarán mensajes de error
    | detallados con trazas de pila en cada error que ocurra dentro de su
    | aplicación. Si está desactivado, se muestra una página de error genérica simple.
    |
    */

    'debug' => (bool) env('APP_DEBUG', false),

    /*
    |--------------------------------------------------------------------------
    | URL de la Aplicación
    |--------------------------------------------------------------------------
    |
    | Esta URL es utilizada por la consola para generar correctamente URLs al usar
    | la herramienta de línea de comandos Artisan. Debe establecer esto en la raíz de
    | la aplicación para que esté disponible en los comandos de Artisan.
    |
    */

    'url' => env('APP_URL', 'http://localhost'),

    /*
    |--------------------------------------------------------------------------
    | Zona Horaria de la Aplicación
    |--------------------------------------------------------------------------
    |
    | Aquí puede especificar la zona horaria por defecto para su aplicación, que
    | será utilizada por las funciones de fecha y hora de PHP. La zona horaria
    | se establece en "UTC" por defecto ya que es adecuada para la mayoría de los casos.
    |
    */

    'timezone' => 'UTC',

    /*
    |--------------------------------------------------------------------------
    | Configuración de Idioma de la Aplicación
    |--------------------------------------------------------------------------
    |
    | El idioma de la aplicación determina el idioma por defecto que utilizarán
    | los métodos de traducción / localización de Laravel. Esta opción se puede
    | establecer en cualquier idioma para el que planee tener cadenas de traducción.
    |
    */

    'locale' => env('APP_LOCALE', 'en'),

    'fallback_locale' => env('APP_FALLBACK_LOCALE', 'en'),

    'faker_locale' => env('APP_FAKER_LOCALE', 'en_US'),

    /*
    |--------------------------------------------------------------------------
    | Clave de Cifrado
    |--------------------------------------------------------------------------
    |
    | Esta clave es utilizada por los servicios de cifrado de Laravel y debe establecerse
    | en una cadena aleatoria de 32 caracteres para garantizar que todos los valores cifrados
    | estén seguros. Debe hacer esto antes de implementar la aplicación.
    |
    */

    'cipher' => 'AES-256-CBC',

    'key' => env('APP_KEY'),

    'previous_keys' => [
        ...array_filter(
            explode(',', (string) env('APP_PREVIOUS_KEYS', ''))
        ),
    ],

    /*
    |--------------------------------------------------------------------------
    | Controlador del Modo de Mantenimiento
    |--------------------------------------------------------------------------
    |
    | Estas opciones de configuración determinan el controlador utilizado para determinar y
    | gestionar el estado de "modo de mantenimiento" de Laravel. El controlador "cache" permitirá
    | que el modo de mantenimiento se controle en varias máquinas.
    |
    | Controladores soportados: "file", "cache"
    |
    */

    'maintenance' => [
        'driver' => env('APP_MAINTENANCE_DRIVER', 'file'),
        'store' => env('APP_MAINTENANCE_STORE', 'database'),
    ],

];
