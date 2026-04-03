<?php

class AuthController {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function register() {
        $data = json_decode(file_get_contents('php://input'), true);
        
        $name = $data['nombre'] ?? ''; // El backend espera 'nombre'
        $email = $data['email'] ?? '';
        $password = $data['password'] ?? '';

        if (empty($name) || empty($email) || empty($password)) {
            http_response_code(400);
            echo json_encode(['error' => 'Faltan campos obligatorios']);
            return;
        }

        $passwordValidation = $this->validatePassword($password);
        if ($passwordValidation !== true) {
             http_response_code(400);
             echo json_encode(['error' => $passwordValidation]);
             return;
        }

        // Verificar si el email existe
        $stmt = $this->db->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute([$email]);
        if ($stmt->fetch()) {
            http_response_code(409);
            echo json_encode(['error' => 'El email ya está registrado']);
            return;
        }

        $passwordHash = password_hash($password, PASSWORD_DEFAULT);
        $rol = 'cliente';

        try {
            $stmt = $this->db->prepare("INSERT INTO users (nombre, email, password_hash, rol) VALUES (?, ?, ?, ?)");
            $stmt->execute([$name, $email, $passwordHash, $rol]);

            $userId = $this->db->lastInsertId();

            // Inicio de sesión automático
            session_regenerate_id(true);
            $_SESSION['user_id'] = $userId;
            $_SESSION['user_rol'] = $rol;

            http_response_code(201);
            echo json_encode([
                'message' => 'Usuario registrado correctamente',
                'user' => [
                    'id' => $userId,
                    'nombre' => $name,
                    'email' => $email,
                    'rol' => $rol
                ]
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error del servidor. Inténtalo más tarde.']);
        }
    }

    public function login() {
        $data = json_decode(file_get_contents('php://input'), true);
        
        $email = $data['email'] ?? '';
        $password = $data['password'] ?? '';

        if (empty($email) || empty($password)) {
            http_response_code(400);
            echo json_encode(['error' => 'Faltan credenciales']);
            return;
        }

        $stmt = $this->db->prepare("SELECT id, nombre, email, password_hash, rol FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user && password_verify($password, $user['password_hash'])) {
            session_regenerate_id(true);
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['user_rol'] = $user['rol'];
            
            http_response_code(200);
            echo json_encode([
                'message' => 'Login exitoso',
                'user' => [
                    'id' => $user['id'],
                    'nombre' => $user['nombre'],
                    'email' => $user['email'],
                    'rol' => $user['rol']
                ]
            ]);
        } else {
            sleep(1);
            http_response_code(401);
            echo json_encode(['error' => 'Credenciales inválidas']);
        }
    }

    public function logout() {
        session_destroy();
        // Limpiar la cookie de sesión implica funcionalidad en cliente/servidor,
        // normalmente session_destroy es suficiente en el lado del servidor.
        // También podemos expirar la cookie para mayor seguridad.
        if (ini_get("session.use_cookies")) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000,
                $params["path"], $params["domain"],
                $params["secure"], $params["httponly"]
            );
        }
        echo json_encode(['message' => 'Sesión cerrada exitosamente']);
    }

    public function me() {
        if (isset($_SESSION['user_id'])) {
            $stmt = $this->db->prepare("SELECT id, nombre, email, rol FROM users WHERE id = ?");
            $stmt->execute([$_SESSION['user_id']]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($user) {
                http_response_code(200);
                echo json_encode($user);
            } else {
                session_destroy();
                http_response_code(401);
                echo json_encode(['error' => 'Usuario no encontrado']);
            }
        } else {
            http_response_code(401);
            echo json_encode(['error' => 'No autenticado']);
        }
    }
    public function updateProfile() {
        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(['error' => 'No autenticado']);
            return;
        }

        $data = json_decode(file_get_contents('php://input'), true);
        $email = $data['email'] ?? null;
        $name = $data['nombre'] ?? null;

        if (!$email && !$name) {
            http_response_code(400);
            echo json_encode(['error' => 'Se requiere al menos un campo para actualizar']);
            return;
        }

        try {
            // Iniciar transacción
            $this->db->beginTransaction();

            $updates = [];
            $params = [];

            if ($email) {
                // Verificar si el email ya está en uso por otro usuario
                $stmt = $this->db->prepare("SELECT id FROM users WHERE email = ? AND id != ?");
                $stmt->execute([$email, $_SESSION['user_id']]);
                if ($stmt->fetch()) {
                    $this->db->rollBack();
                    http_response_code(409);
                    echo json_encode(['error' => 'El email ya está en uso']);
                    return;
                }
                $updates[] = "email = ?";
                $params[] = $email;
            }

            if ($name) {
                $updates[] = "nombre = ?";
                $params[] = $name;
            }

            if (!empty($updates)) {
                $sql = "UPDATE users SET " . implode(', ', $updates) . " WHERE id = ?";
                $params[] = $_SESSION['user_id'];
                $stmt = $this->db->prepare($sql);
                $stmt->execute($params);
            }

            $this->db->commit();

            // Obtener usuario actualizado
            $stmt = $this->db->prepare("SELECT id, nombre, email, rol FROM users WHERE id = ?");
            $stmt->execute([$_SESSION['user_id']]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            echo json_encode(['message' => 'Perfil actualizado', 'user' => $user]);

        } catch (Exception $e) {
            $this->db->rollBack();
            http_response_code(500);
            echo json_encode(['error' => 'Error al actualizar perfil. Inténtalo más tarde.']);
        }
    }

    public function updatePassword() {
        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(['error' => 'No autenticado']);
            return;
        }

        $data = json_decode(file_get_contents('php://input'), true);
        $currentPassword = $data['currentPassword'] ?? '';
        $newPassword = $data['newPassword'] ?? '';

        if (empty($currentPassword) || empty($newPassword)) {
            http_response_code(400);
            echo json_encode(['error' => 'Faltan campos (contraseña actual o nueva)']);
            return;
        }

        $passwordValidation = $this->validatePassword($newPassword);
        if ($passwordValidation !== true) {
            http_response_code(400);
            echo json_encode(['error' => $passwordValidation]);
            return;
        }

        // Verificar contraseña actual
        $stmt = $this->db->prepare("SELECT password_hash FROM users WHERE id = ?");
        $stmt->execute([$_SESSION['user_id']]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user || !password_verify($currentPassword, $user['password_hash'])) {
            http_response_code(401);
            echo json_encode(['error' => 'La contraseña actual es incorrecta']);
            return;
        }

        // Actualizar contraseña
        $newHash = password_hash($newPassword, PASSWORD_DEFAULT);
        $stmt = $this->db->prepare("UPDATE users SET password_hash = ? WHERE id = ?");
        $stmt->execute([$newHash, $_SESSION['user_id']]);

        echo json_encode(['message' => 'Contraseña actualizada correctamente']);
    }

    private function validatePassword($password) {
        if (strlen($password) < 8) {
            return 'La contraseña debe tener al menos 8 caracteres';
        }
        if (!preg_match('/[A-Z]/', $password)) {
            return 'La contraseña debe tener al menos una letra mayúscula';
        }
        if (!preg_match('/[a-z]/', $password)) {
            return 'La contraseña debe tener al menos una letra minúscula';
        }
        if (!preg_match('/[0-9]/', $password)) {
            return 'La contraseña debe tener al menos un número';
        }
        if (!preg_match('/[\W_]/', $password)) {
            return 'La contraseña debe tener al menos un carácter especial';
        }
        return true;
    }
}

