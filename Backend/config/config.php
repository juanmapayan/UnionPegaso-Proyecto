<?php

return [
    'db' => [
        'host'     => getenv('DB_HOST') ?: '127.0.0.1',
        'port'     => getenv('DB_PORT') ?: '3306',
        'dbname'   => getenv('DB_NAME') ?: 'unionpegaso',
        'user'     => getenv('DB_USER') ?: 'root',
        'password' => getenv('DB_PASS') ?: '',
        'charset'  => 'utf8mb4'
    ],
    'cors' => [
        'allowed_origins' => [
            'http://localhost:4200',
            'http://localhost:8000',
            'https://unionpegaso.es',
            'https://www.unionpegaso.es',
        ]
    ],
    'mail' => [
        // Activar en producción: MAIL_ENABLED=true o cambiar a true directamente
        'enabled'     => (bool)(getenv('MAIL_ENABLED') ?: false),
        'admin_email' => getenv('MAIL_ADMIN_EMAIL') ?: 'unionpegaso@gmail.com',
        'from'        => getenv('MAIL_FROM')        ?: 'noreply@unionpegaso.com',
    ]
];
