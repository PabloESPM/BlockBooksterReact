<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Valores por Defecto de Autenticación
    |--------------------------------------------------------------------------
    |
    | Esta opción define el "guard" de autenticación por defecto y el "broker"
    | de restablecimiento de contraseña para su aplicación. Puede cambiar estos valores
    | según sea necesario, pero son un comienzo perfecto para la mayoría de las aplicaciones.
    |
    */

    'defaults' => [
        'guard' => env('AUTH_GUARD', 'web'),
        'passwords' => env('AUTH_PASSWORD_BROKER', 'users'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Guardias de Autenticación
    |--------------------------------------------------------------------------
    |
    | A continuación, puede definir cada guardia de autenticación para su aplicación.
    | Por supuesto, se ha definido una excelente configuración por defecto para usted
    | que utiliza el almacenamiento de sesiones además del proveedor de usuarios Eloquent.
    |
    | Todos los guardias de autenticación tienen un proveedor de usuarios, que define cómo
    | se recuperan realmente los usuarios de su base de datos u otro sistema de
    | almacenamiento utilizado por la aplicación. Normalmente se utiliza Eloquent.
    |
    | Soportado: "session"
    |
    */

    'guards' => [
        'web' => [
            'driver' => 'session',
            'provider' => 'users',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Proveedores de Usuarios
    |--------------------------------------------------------------------------
    |
    | Todos los guardias de autenticación tienen un proveedor de usuarios, que define cómo
    | se recuperan realmente los usuarios de su base de datos u otro sistema de
    | almacenamiento utilizado por la aplicación. Normalmente se utiliza Eloquent.
    |
    | Si tiene varias tablas o modelos de usuarios, puede configurar varios
    | proveedores para representar el modelo / tabla. Estos proveedores pueden entonces
    | ser asignados a cualquier guardia de autenticación adicional que haya definido.
    |
    | Soportados: "database", "eloquent"
    |
    */

    'providers' => [
        'users' => [
            'driver' => 'eloquent',
            'model' => env('AUTH_MODEL', App\Models\User::class),
        ],

        // 'users' => [
        //     'driver' => 'database',
        //     'table' => 'users',
        // ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Restablecimiento de Contraseñas
    |--------------------------------------------------------------------------
    |
    | Estas opciones de configuración especifican el comportamiento de la funcionalidad
    | de restablecimiento de contraseña de Laravel, incluyendo la tabla utilizada para el almacenamiento
    | de tokens y el proveedor de usuarios que se invoca para recuperar realmente a los usuarios.
    |
    | El tiempo de expiración es el número de minutos que cada token de restablecimiento se
    | considerará válido. Esta característica de seguridad mantiene los tokens de corta duración para
    | que tengan menos tiempo para ser adivinados. Puede cambiar esto según sea necesario.
    |
    | El ajuste de limitación es el número de segundos que un usuario debe esperar antes de
    | generar más tokens de restablecimiento de contraseña. Esto evita que el usuario
    | genere rápidamente una cantidad muy grande de tokens de restablecimiento de contraseña.
    |
    */

    'passwords' => [
        'users' => [
            'provider' => 'users',
            'table' => env('AUTH_PASSWORD_RESET_TOKEN_TABLE', 'password_reset_tokens'),
            'expire' => 60,
            'throttle' => 60,
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Tiempo de Espera de Confirmación de Contraseña
    |--------------------------------------------------------------------------
    |
    | Aquí puede definir la cantidad de segundos antes de que expire una ventana de
    | confirmación de contraseña y se pida a los usuarios que vuelvan a introducir su contraseña
    | a través de la pantalla de confirmación. Por defecto, el tiempo de espera dura tres horas.
    |
    */

    'password_timeout' => env('AUTH_PASSWORD_TIMEOUT', 10800),

];
