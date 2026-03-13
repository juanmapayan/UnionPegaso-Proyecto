<?php

return [
    'db' => [
        'host' => getenv('DB_HOST') ?: '127.0.0.1',
        'port' => getenv('DB_PORT') ?: '3306',
        'dbname' => getenv('DB_NAME') ?: 'unionpegaso',
        'user' => getenv('DB_USER') ?: 'root',
        'password' => getenv('DB_PASS') ?: '',
        'charset' => 'utf8mb4'
    ],
    'cors' => [
        'allowed_origins' => [
            'http://localhost:4200',
            'http://localhost:8000',
            // Add VPS domain here
        ]
    ]
];
