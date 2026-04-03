<?php

// Reporte de errores — solo activo en desarrollo
if (getenv('APP_ENV') === 'development') {
    ini_set('display_errors', 1);
    ini_set('display_startup_errors', 1);
    error_reporting(E_ALL);
} else {
    ini_set('display_errors', 0);
    ini_set('display_startup_errors', 0);
    error_reporting(0);
}

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../src/Database.php';
require_once __DIR__ . '/../src/Router.php';

// Manejo de CORS
$config = require __DIR__ . '/../config/config.php';
$allowedOrigins = $config['cors']['allowed_origins'] ?? [];
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

// Inicio de sesión
ini_set('session.cookie_httponly', 1);
ini_set('session.cookie_samesite', 'Lax');
if (getenv('APP_ENV') !== 'development') {
    ini_set('session.cookie_secure', 1);
}
session_start();

// Inicializar Router
$router = new Router();

// Definir Controladores (Autoloading sería mejor, pero lo mantenemos simple)
// Requeriremos los controladores aquí conforme los implementemos


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

// Servicios
$router->add('GET', 'api/admin/services', [$adminController, 'indexServices']);
$router->add('POST', 'api/admin/services', [$adminController, 'createService']);
$router->add('PATCH', 'api/admin/services/{id}', [$adminController, 'updateService']);
$router->add('PUT', 'api/admin/services/{id}', [$adminController, 'updateService']);
$router->add('DELETE', 'api/admin/services/{id}', [$adminController, 'deleteService']);

$router->add('GET', 'api/admin/cases', [$adminController, 'indexCases']);
$router->add('POST', 'api/admin/cases', [$adminController, 'createCase']);
$router->add('PATCH', 'api/admin/cases/{id}', [$adminController, 'updateCase']);
$router->add('PUT', 'api/admin/cases/{id}', [$adminController, 'updateCase']);
$router->add('DELETE', 'api/admin/cases/{id}', [$adminController, 'deleteCase']);

// Casos de éxito
require_once __DIR__ . '/../src/Controllers/SuccessCaseController.php';
$successCaseController = new SuccessCaseController();



$router->add('GET', 'api/cases', [$successCaseController, 'index']);
$router->add('GET', 'api/cases/{slug}', [$successCaseController, 'show']);

// Portafolio
require_once __DIR__ . '/../src/Controllers/PortfolioController.php';
$portfolioController = new PortfolioController();

$router->add('GET', 'api/portfolio', [$portfolioController, 'index']);

$router->add('GET', 'api', function() {
    http_response_code(200);
    echo json_encode(['status' => 'ok', 'message' => 'Union Pegaso API Running']);
});

$router->add('GET', '/', function() {
    echo json_encode(['message' => 'Union Pegaso API']);
});

require_once __DIR__ . '/../src/Controllers/LeadController.php';
$leadController = new LeadController();
$router->add('POST', 'api/leads', [$leadController, 'create']);

$router->add('GET',    'api/admin/dashboard',        [$adminController, 'indexDashboard']);
$router->add('GET',    'api/admin/leads',            [$adminController, 'indexLeads']);
$router->add('PATCH',  'api/admin/leads/{id}',       [$adminController, 'updateLeadStatus']);

// Portafolio
$router->add('POST',   'api/admin/upload',             [$adminController, 'uploadMedia']);

$router->add('GET',    'api/admin/portfolio',         [$adminController, 'indexPortfolio']);
$router->add('POST',   'api/admin/portfolio',         [$adminController, 'createPortfolio']);
$router->add('PATCH',  'api/admin/portfolio/{id}',    [$adminController, 'updatePortfolio']);
$router->add('PUT',    'api/admin/portfolio/{id}',    [$adminController, 'updatePortfolio']);
$router->add('DELETE', 'api/admin/portfolio/{id}',    [$adminController, 'deletePortfolio']);

$router->dispatch($_SERVER['REQUEST_METHOD'], $_SERVER['REQUEST_URI']);