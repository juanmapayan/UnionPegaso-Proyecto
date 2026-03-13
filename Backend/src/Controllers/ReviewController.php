<?php

class ReviewController {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function indexApproved() {
        try {
            $stmt = $this->db->prepare("SELECT * FROM reviews WHERE status = 'approved' ORDER BY created_at DESC");
            $stmt->execute();
            $reviews = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($reviews);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error al obtener reseñas: ' . $e->getMessage()]);
        }
    }

    public function create() {
        $data = json_decode(file_get_contents('php://input'), true);

        $authorName = $data['author_name'] ?? '';
        $rating = $data['rating'] ?? 0;
        $comment = $data['comment'] ?? '';
        $authorEmail = $data['author_email'] ?? ''; // Optional
        $relatedType = $data['related_type'] ?? 'general';
        $relatedId = $data['related_id'] ?? null;
        $userId = $_SESSION['user_id'] ?? null; // If logged in

        if (empty($authorName) || empty($comment) || $rating < 1 || $rating > 5) {
            http_response_code(400);
            echo json_encode(['error' => 'Datos inválidos. Nombre, comentario y valoración (1-5) son obligatorios.']);
            return;
        }

        try {
            $stmt = $this->db->prepare("INSERT INTO reviews (user_id, author_name, author_email, rating, comment, status, related_type, related_id) VALUES (?, ?, ?, ?, ?, 'pending', ?, ?)");
            $stmt->execute([$userId, $authorName, $authorEmail, $rating, $comment, $relatedType, $relatedId]);
            
            http_response_code(201);
            echo json_encode(['message' => 'Reseña enviada correctamente. Estará visible tras la aprobación de un moderador.']);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error al enviar reseña: ' . $e->getMessage()]);
        }
    }
}
