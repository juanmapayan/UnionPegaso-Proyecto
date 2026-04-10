<?php
require_once __DIR__ . '/../src/Database.php';

try {
    $db = Database::getInstance()->getConnection();

    $migrationFiles = glob(__DIR__ . '/../migrations/*.sql');
    sort($migrationFiles);

    foreach ($migrationFiles as $file) {
        echo "Running: " . basename($file) . PHP_EOL;
        $sql = file_get_contents($file);
        $db->exec($sql);
    }

    echo "All migrations executed successfully." . PHP_EOL;
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . PHP_EOL;
}