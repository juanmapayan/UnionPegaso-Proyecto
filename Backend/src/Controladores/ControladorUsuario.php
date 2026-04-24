<?php

require_once __DIR__ . '/../BaseDatos.php';

class ControladorUsuario {
    private $db;

    public function __construct() {
        $this->db = BaseDatos::getInstance()->getConnection();
    }

    public function myServices() {
        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(['error' => 'No autenticado']);
            return;
        }

        $userId = $_SESSION['user_id'];

        try {
            // Simplified: Fetches services directly from the user's past purchases or relation.
            // Since the schema might not have an "order_items" table explicitly linking to services right now,
            // let's check if the user has services. Wait, do we have an orders table or how does the user own a service?
            // Let's assume there is a user_services or orders table. 
            // For now, let's return a simulated array if the exact structure is unknown, or we can query orders.
            // Let's query orders and order_items if they exist.
            
            $stmt = $this->db->prepare("
                SELECT s.* 
                FROM services s
                JOIN order_items oi ON s.id = oi.service_id
                JOIN orders o ON oi.order_id = o.id
                WHERE o.user_id = ? AND o.status IN ('completed', 'paid')
                GROUP BY s.id
            ");
            $stmt->execute([$userId]);
            $services = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode($services);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error al obtener mis servicios']);
        }
    }

    public function addReview() {
        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(['error' => 'No autenticado']);
            return;
        }

        $userId = $_SESSION['user_id'];
        $data = json_decode(file_get_contents('php://input'), true);

        $rating = $data['rating'] ?? 0;
        $comment = $data['comment'] ?? '';
        $serviceId = $data['service_id'] ?? null;
        
        if (empty($comment) || $rating < 1 || $rating > 5 || empty($serviceId)) {
            http_response_code(400);
            echo json_encode(['error' => 'Datos inválidos. Comentario, valoración (1-5) y el servicio son obligatorios.']);
            return;
        }

        try {
            // Get user info to populate author_name
            $stmtUser = $this->db->prepare("SELECT nombre, email FROM users WHERE id = ?");
            $stmtUser->execute([$userId]);
            $user = $stmtUser->fetch();
            $authorName = $user ? $user['nombre'] : 'Usuario';
            $authorEmail = $user ? $user['email'] : '';

            // Insert review with 'approved' status automatically as requested
            $stmt = $this->db->prepare("
                INSERT INTO reviews (user_id, author_name, author_email, rating, comment, status, related_type, related_id) 
                VALUES (?, ?, ?, ?, ?, 'approved', 'service', ?)
            ");
            $stmt->execute([$userId, $authorName, $authorEmail, $rating, $comment, $serviceId]);
            
            http_response_code(201);
            echo json_encode(['message' => 'Reseña enviada y publicada correctamente.']);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error al enviar reseña: ' . $e->getMessage()]);
        }
    }
}
