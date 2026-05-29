<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>BlockBookster</title>

    <!-- SEO -->
    <meta name="description" content="BlockBookster — Tu red social de libros. Descubre, valora y comparte tus lecturas favoritas.">

    <!-- Fuentes: Space Grotesk + Inter -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&family=Space+Grotesk:wght@500;700&display=swap"
        rel="stylesheet">

    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/react/main.jsx'])
</head>

<body class="font-body bg-gray-50 text-black antialiased">
    <div id="react-app"></div>
</body>

</html>
