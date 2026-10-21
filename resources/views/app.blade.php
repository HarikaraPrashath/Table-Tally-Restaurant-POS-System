<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <title>Restaurant POS</title>

    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/main.tsx'])
    @inertiaHead
</head>

<body>
    @inertia
</body>
</html>