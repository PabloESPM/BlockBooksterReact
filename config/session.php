<?php

use Illuminate\Support\Str;

return [

    /*
    |--------------------------------------------------------------------------
    | Controlador de Sesión por Defecto
    |--------------------------------------------------------------------------
    |
    | Esta opción determina el controlador de sesión por defecto que se utiliza para
    | las solicitudes entrantes. Laravel admite una variedad de opciones de almacenamiento para
    | persistir los datos de la sesión. El almacenamiento en base de datos es una gran opción por defecto.
    |
    | Soportados: "file", "cookie", "database", "memcached",
    |            "redis", "dynamodb", "array"
    |
    */

    'driver' => env('SESSION_DRIVER', 'database'),

    /*
    |--------------------------------------------------------------------------
    | Duración de la Sesión
    |--------------------------------------------------------------------------
    |
    | Aquí puede especificar la cantidad de minutos que desea que la sesión
    | permanezca inactiva antes de que expire. Si desea que expiren
    | inmediatamente cuando se cierre el navegador, puede indicarlo a través
    | de la opción de configuración expire_on_close.
    |
    */

    'lifetime' => (int) env('SESSION_LIFETIME', 120),

    'expire_on_close' => env('SESSION_EXPIRE_ON_CLOSE', false),

    /*
    |--------------------------------------------------------------------------
    | Cifrado de Sesión
    |--------------------------------------------------------------------------
    |
    | Esta opción le permite especificar fácilmente que todos los datos de su sesión
    | deben cifrarse antes de almacenarse. Todo el cifrado se realiza de forma
    | automática por Laravel y puede usar la sesión como de costumbre.
    |
    */

    // HAL-SEC-09: default true — las sesiones se cifran antes de almacenarse.
    // Para entornos locales sin impacto en rendimiento, se puede establecer SESSION_ENCRYPT=false en .env
    'encrypt' => env('SESSION_ENCRYPT', true),


    /*
    |--------------------------------------------------------------------------
    | Ubicación del Archivo de Sesión
    |--------------------------------------------------------------------------
    |
    | Al utilizar el controlador de sesión "file", los archivos de sesión se colocan
    | en el disco. La ubicación de almacenamiento por defecto se define aquí; sin embargo,
    | es libre de proporcionar otra ubicación donde deban almacenarse.
    |
    */

    'files' => storage_path('framework/sessions'),

    /*
    |--------------------------------------------------------------------------
    | Conexión de Base de Datos de Sesión
    |--------------------------------------------------------------------------
    |
    | Al usar los controladores de sesión "database" o "redis", puede especificar una
    | conexión que debe usarse para administrar estas sesiones. Esto debe
    | corresponder a una conexión en sus opciones de configuración de base de datos.
    |
    */

    'connection' => env('SESSION_CONNECTION'),

    /*
    |--------------------------------------------------------------------------
    | Tabla de Base de Datos de Sesión
    |--------------------------------------------------------------------------
    |
    | Al usar el controlador de sesión "database", puede especificar la tabla que se
    | utilizará para almacenar las sesiones. Por supuesto, se define un valor por defecto
    | sensato para usted; sin embargo, puede cambiar esto a otra tabla.
    |
    */

    'table' => env('SESSION_TABLE', 'sessions'),

    /*
    |--------------------------------------------------------------------------
    | Almacén de Caché de Sesión
    |--------------------------------------------------------------------------
    |
    | Al usar uno de los backends de sesión controlados por caché del framework, puede
    | definir el almacén de caché que debe usarse para almacenar los datos de la sesión
    | entre solicitudes. Esto debe coincidir con uno de sus almacenes de caché definidos.
    |
    | Afecta a: "dynamodb", "memcached", "redis"
    |
    */

    'store' => env('SESSION_STORE'),

    /*
    |--------------------------------------------------------------------------
    | Lotería de Limpieza de Sesiones
    |--------------------------------------------------------------------------
    |
    | Algunos controladores de sesión deben barrer manualmente su ubicación de almacenamiento para
    | deshacerse de las sesiones antiguas del almacenamiento. Aquí están las probabilidades de que
    | ocurra en una solicitud determinada. Por defecto, las probabilidades son de 2 sobre 100.
    |
    */

    'lottery' => [2, 100],

    /*
    |--------------------------------------------------------------------------
    | Nombre de la Cookie de Sesión
    |--------------------------------------------------------------------------
    |
    | Aquí puede cambiar el nombre de la cookie de sesión que crea el
    | framework. Normalmente, no debería necesitar cambiar este valor,
    | ya que hacerlo no otorga una mejora de seguridad significativa.
    |
    */

    'cookie' => env(
        'SESSION_COOKIE',
        Str::slug((string) env('APP_NAME', 'laravel')).'-session'
    ),

    /*
    |--------------------------------------------------------------------------
    | Ruta de la Cookie de Sesión
    |--------------------------------------------------------------------------
    |
    | La ruta de la cookie de sesión determina la ruta para la cual la cookie estará
    | disponible. Normalmente, esta será la ruta raíz de su aplicación,
    | pero es libre de cambiar esto cuando sea necesario.
    |
    */

    'path' => env('SESSION_PATH', '/'),

    /*
    |--------------------------------------------------------------------------
    | Dominio de la Cookie de Sesión
    |--------------------------------------------------------------------------
    |
    | Este valor determina el dominio y los subdominios para los que la cookie de sesión está
    | disponible. Por defecto, la cookie estará disponible para el dominio raíz
    | sin subdominios. Normalmente, esto no debería cambiarse.
    |
    */

    'domain' => env('SESSION_DOMAIN'),

    /*
    |--------------------------------------------------------------------------
    | Cookies Solo HTTPS
    |--------------------------------------------------------------------------
    |
    | Al establecer esta opción en true, las cookies de sesión solo se enviarán de vuelta
    | al servidor si el navegador tiene una conexión HTTPS. Esto evitará que
    | la cookie se le envíe cuando no se pueda hacer de forma segura.
    |
    */

    'secure' => env('SESSION_SECURE_COOKIE', env('APP_ENV', 'production') === 'production'),

    /*
    |--------------------------------------------------------------------------
    | Acceso Solo HTTP
    |--------------------------------------------------------------------------
    |
    | Establecer este valor en true evitará que JavaScript acceda al valor de la
    | cookie y la cookie solo será accesible a través del protocolo HTTP.
    | Es poco probable que deba desactivar esta opción.
    |
    */

    'http_only' => env('SESSION_HTTP_ONLY', true),

    /*
    |--------------------------------------------------------------------------
    | Cookies de Mismo Sitio (Same-Site)
    |--------------------------------------------------------------------------
    |
    | Esta opción determina cómo se comportan sus cookies cuando se realizan solicitudes
    | entre sitios, y se puede utilizar para mitigar los ataques CSRF. Por defecto, nosotros
    | estableceremos este valor en "lax" para permitir solicitudes seguras entre sitios.
    |
    | See: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie#samesitesamesite-value
    |
    | Soportados: "lax", "strict", "none", null
    |
    */

    'same_site' => env('SESSION_SAME_SITE', 'lax'),

    /*
    |--------------------------------------------------------------------------
    | Cookies Particionadas
    |--------------------------------------------------------------------------
    |
    | Establecer este valor en true vinculará la cookie al sitio de nivel superior para
    | un contexto de sitios cruzados. El navegador acepta cookies particionadas
    | cuando se marcan como "secure" y el atributo Same-Site se establece en "none".
    |
    */

    'partitioned' => env('SESSION_PARTITIONED_COOKIE', false),

];
