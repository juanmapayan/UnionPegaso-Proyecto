<?php

// Error reporting for development
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../src/Database.php';
require_once __DIR__ . '/../src/Router.php';

// CORS Handling
$config = require __DIR__ . '/../config/config.php';
$allowedOrigins = ['http://localhost:4200', 'http://127.0.0.1:4200']; // Explicitly add Angular dev server
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (in_array($origin, $allowedOrigins)) {
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE, PATCH");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
    header("Access-Control-Allow-Credentials: true");
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Session Start
session_start();

// Initialize Router
$router = new Router();

// Define Controllers (Autoloading would be better, but we keep it simple)
// We will require controllers here as we implement them

// Dispatch
$router = new Router();

require_once __DIR__ . '/../src/Controllers/AuthController.php';
$authController = new AuthController();

$router->add('POST', 'api/auth/register', [$authController, 'register']);
$router->add('POST', 'api/auth/login', [$authController, 'login']);
$router->add('POST', 'api/auth/logout', [$authController, 'logout']);
$router->add('GET', 'api/auth/me', [$authController, 'me']);
$router->add('PATCH', 'api/users/me', [$authController, 'updateProfile']);
$router->add('PATCH', 'api/users/me/password', [$authController, 'updatePassword']);

require_once __DIR__ . '/../src/Controllers/ServiceController.php';
$serviceController = new ServiceController();

$router->add('GET', 'api/services', [$serviceController, 'index']);
$router->add('GET', 'api/services/{id}', [$serviceController, 'show']);

// --- Admin Routes ---
require_once __DIR__ . '/../src/Controllers/AdminController.php';
$adminController = new AdminController();

// Services
$router->add('GET', 'api/admin/services', [$adminController, 'indexServices']);
$router->add('POST', 'api/admin/services', [$adminController, 'createService']);
$router->add('PATCH', 'api/admin/services/{id}', [$adminController, 'updateService']);
// Support PUT in addition to PATCH for updates to align with REST conventions
$router->add('PUT', 'api/admin/services/{id}', [$adminController, 'updateService']);
$router->add('DELETE', 'api/admin/services/{id}', [$adminController, 'deleteService']);

// Success Cases
$router->add('GET', 'api/admin/cases', [$adminController, 'indexCases']);
$router->add('POST', 'api/admin/cases', [$adminController, 'createCase']);
$router->add('PATCH', 'api/admin/cases/{id}', [$adminController, 'updateCase']);
$router->add('DELETE', 'api/admin/cases/{id}', [$adminController, 'deleteCase']);



$router->add('GET', 'api', function() {
    http_response_code(200);
    echo json_encode(['status' => 'ok', 'message' => 'Union Pegaso API Running']);
});

$router->add('GET', '/', function() {
    echo json_encode(['message' => 'Union Pegaso API']);
});

// Dispatch
$method = $_SERVER['REQUEST_METHOD'];
$uri = $_SERVER['REQUEST_URI'];
$router->dispatch($method, $uri);
