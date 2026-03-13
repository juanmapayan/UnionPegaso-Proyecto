<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

echo "Loading Database...\n";
require_once __DIR__ . '/../src/Database.php';

if (class_exists('Database')) {
    echo "Class Database exists.\n";
    if (method_exists('Database', 'getInstance')) {
        echo "Method getInstance exists.\n";
        try {
            $db = Database::getInstance();
            echo "Instance got.\n";
            $conn = $db->getConnection();
            echo "Connection got.\n";
        } catch (Exception $e) {
            echo "Error: " . $e->getMessage() . "\n";
        }
    } else {
        echo "Method getInstance does NOT exist.\n";
        $methods = get_class_methods('Database');
        print_r($methods);
    }
} else {
    echo "Class Database does NOT exist.\n";
}
