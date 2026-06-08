<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Servicios de Terceros
    |--------------------------------------------------------------------------
    |
    | Este archivo es para almacenar las credenciales de servicios de terceros como
    | Mailgun, Postmark, AWS y más. Este archivo proporciona la ubicación de hecho
    | para este tipo de información, lo que permite que los paquetes tengan
    | un archivo convencional para ubicar las diversas credenciales del servicio.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

];
