<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Transmisor de Correo por Defecto
    |--------------------------------------------------------------------------
    |
    | Esta opción controla el transmisor de correo por defecto que se utiliza para enviar todos los
    | mensajes de correo electrónico a menos que se especifique explícitamente otro transmisor al enviar
    | el mensaje. Todos los transmisores adicionales se pueden configurar dentro del
    | array "mailers". Se proporcionan ejemplos de cada tipo de transmisor.
    |
    */

    'default' => env('MAIL_MAILER', 'log'),

    /*
    |--------------------------------------------------------------------------
    | Configuraciones de Transmisores de Correo
    |--------------------------------------------------------------------------
    |
    | Aquí puede configurar todos los transmisores de correo utilizados por su aplicación más
    | sus respectivos ajustes. Se han configurado varios ejemplos para
    | usted y es libre de agregar los suyos propios según lo requiera su aplicación.
    |
    | Laravel admite una variedad de controladores de "transporte" de correo que se pueden utilizar
    | al entregar un correo electrónico. Puede especificar cuál está utilizando para
    | sus transmisores a continuación. También puede agregar transmisores adicionales si es necesario.
    |
    | Soportados: "smtp", "sendmail", "mailgun", "ses", "ses-v2",
    |            "postmark", "resend", "log", "array",
    |            "failover", "roundrobin"
    |
    */

    'mailers' => [

        'smtp' => [
            'transport' => 'smtp',
            'scheme' => env('MAIL_SCHEME'),
            'url' => env('MAIL_URL'),
            'host' => env('MAIL_HOST', '127.0.0.1'),
            'port' => env('MAIL_PORT', 2525),
            'username' => env('MAIL_USERNAME'),
            'password' => env('MAIL_PASSWORD'),
            'timeout' => null,
            'local_domain' => env('MAIL_EHLO_DOMAIN', parse_url((string) env('APP_URL', 'http://localhost'), PHP_URL_HOST)),
        ],

        'ses' => [
            'transport' => 'ses',
        ],

        'postmark' => [
            'transport' => 'postmark',
            // 'message_stream_id' => env('POSTMARK_MESSAGE_STREAM_ID'),
            // 'client' => [
            //     'timeout' => 5,
            // ],
        ],

        'resend' => [
            'transport' => 'resend',
        ],

        'sendmail' => [
            'transport' => 'sendmail',
            'path' => env('MAIL_SENDMAIL_PATH', '/usr/sbin/sendmail -bs -i'),
        ],

        'log' => [
            'transport' => 'log',
            'channel' => env('MAIL_LOG_CHANNEL'),
        ],

        'array' => [
            'transport' => 'array',
        ],

        'failover' => [
            'transport' => 'failover',
            'mailers' => [
                'smtp',
                'log',
            ],
            'retry_after' => 60,
        ],

        'roundrobin' => [
            'transport' => 'roundrobin',
            'mailers' => [
                'ses',
                'postmark',
            ],
            'retry_after' => 60,
        ],

    ],

    /*
    |--------------------------------------------------------------------------
    | Dirección "From" Global
    |--------------------------------------------------------------------------
    |
    | Es posible que desee que todos los correos electrónicos enviados por su aplicación se envíen desde
    | la misma dirección. Aquí puede especificar un nombre y una dirección que se
    | utilicen globalmente para todos los correos electrónicos enviados por su aplicación.
    |
    */

    'from' => [
        'address' => env('MAIL_FROM_ADDRESS', 'hello@example.com'),
        'name' => env('MAIL_FROM_NAME', 'Example'),
    ],

];
