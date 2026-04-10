<?php

require_once __DIR__ . '/../BaseDatos.php';

class ControladorWeb {
    private $db;

    public function __construct() {
        $this->db = BaseDatos::getInstance()->getConnection();
    }

    // ==========================================
    // PARTE 1: CONTACTOS / LEADS (Anterior LeadController)
    // ==========================================
    public function createLead() {
        $data = json_decode(file_get_contents('php://input'), true);

        $leadType = $data['lead_type'] ?? 'contact';
        $nombre = trim($data['nombre'] ?? '');
        $email = trim($data['email'] ?? '');
        $telefono = trim($data['telefono'] ?? '');
        $empresa = trim($data['empresa'] ?? '');
        $serviceId = $data['service_id'] ?? null;
        $budgetRange = trim($data['budget_range'] ?? '');
        $message = trim($data['message'] ?? '');
        $sourcePage = trim($data['source_page'] ?? '');

        if (!in_array($leadType, ['contact', 'quote'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Tipo de lead no válido']);
            return;
        }

        if ($nombre === '' || $email === '' || $message === '') {
            http_response_code(400);
            echo json_encode(['error' => 'Nombre, email y mensaje son obligatorios']);
            return;
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            echo json_encode(['error' => 'Email no válido']);
            return;
        }

        if (strlen($nombre) > 100 || strlen($email) > 150 || strlen($message) > 5000
            || strlen($telefono) > 30 || strlen($empresa) > 150
            || strlen($budgetRange) > 50 || strlen($sourcePage) > 100) {
            http_response_code(400);
            echo json_encode(['error' => 'Uno o más campos superan la longitud máxima permitida']);
            return;
        }

        try {
            $stmt = $this->db->prepare("
                INSERT INTO contact_leads
                (lead_type, nombre, email, telefono, empresa, service_id, budget_range, message, source_page)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");

            $stmt->execute([
                $leadType,
                $nombre,
                $email,
                $telefono ?: null,
                $empresa ?: null,
                $serviceId ?: null,
                $budgetRange ?: null,
                $message,
                $sourcePage ?: null
            ]);

            $leadId = (int) $this->db->lastInsertId();

            http_response_code(201);
            echo json_encode([
                'success' => true,
                'message' => 'Lead registrado correctamente',
                'id'      => $leadId
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error al registrar el lead. Intenta más tarde.']);
            return;
        }

        // Notificación al admin — fallo silencioso, nunca bloquea el flujo
        $mailConfig = (require __DIR__ . '/../../config/config.php')['mail'] ?? [];
        if (!empty($mailConfig['enabled']) && !empty($mailConfig['admin_email'])) {
            $tipo    = $leadType === 'quote' ? 'Presupuesto' : 'Contacto';
            $subject = "[Union Pegaso] Nuevo lead ($tipo): $nombre";
            $body    = "Nuevo lead recibido en la web.\n\n"
                     . "ID: $leadId\n"
                     . "Tipo: $tipo\n"
                     . "Nombre: $nombre\n"
                     . "Email: $email\n"
                     . ($telefono    ? "Telefono: $telefono\n"       : '')
                     . ($empresa     ? "Empresa: $empresa\n"         : '')
                     . ($budgetRange ? "Presupuesto: $budgetRange\n" : '')
                     . "\nMensaje:\n$message\n"
                     . "\nOrigen: $sourcePage\n"
                     . "---\nGestionar en: /admin/leads";
            $headers = "From: {$mailConfig['from']}\r\nContent-Type: text/plain; charset=UTF-8";
            @mail($mailConfig['admin_email'], $subject, $body, $headers);
        }
    }

    // ==========================================
    // PARTE 2: PORTAFOLIO (Anterior PortfolioController)
    // ==========================================
    public function indexPortfolio() {
        try {
            $limit = isset($_GET['limit']) ? (int) $_GET['limit'] : null;
            $featured = isset($_GET['featured']) ? (int) $_GET['featured'] : null;
            $category = $_GET['category'] ?? null;

            $sql = "SELECT * FROM portfolio_items WHERE visible = 1";

            if ($featured === 1) {
                $sql .= " AND featured = 1";
            }

            if ($category) {
                $sql .= " AND category = :category";
            }

            $sql .= " ORDER BY display_order ASC, created_at DESC";

            if ($limit && $limit > 0) {
                $sql .= " LIMIT :limit";
            }

            $stmt = $this->db->prepare($sql);

            if ($category) {
                $stmt->bindValue(':category', $category, PDO::PARAM_STR);
            }

            if ($limit && $limit > 0) {
                $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
            }

            $stmt->execute();

            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error al cargar portfolio']);
        }
    }

    // ==========================================
    // PARTE 3: RESEÑAS / OPINIONES (Anterior ReviewController)
    // ==========================================
    public function indexReviewsApproved() {
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

    public function createReview() {
        $data = json_decode(file_get_contents('php://input'), true);

        $authorName = $data['author_name'] ?? '';
        $rating = $data['rating'] ?? 0;
        $comment = $data['comment'] ?? '';
        $authorEmail = $data['author_email'] ?? ''; // Opcional
        $relatedType = $data['related_type'] ?? 'general';
        $relatedId = $data['related_id'] ?? null;
        $userId = $_SESSION['user_id'] ?? null; // Si está autenticado

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

    // ==========================================
    // PARTE 4: SERVICIOS (Anterior ServiceController)
    // ==========================================
    public function indexServices() {
        try {
            $limit = isset($_GET['limit']) ? (int) $_GET['limit'] : null;
            $featured = isset($_GET['featured']) ? (int) $_GET['featured'] : null;
    
            $sql = "SELECT * FROM services WHERE is_active = 1";
            if ($featured === 1) {
                $sql .= " AND featured = 1";
            }
            $sql .= " ORDER BY display_order ASC, created_at DESC";
    
            if ($limit && $limit > 0) {
                $sql .= " LIMIT :limit";
                $stmt = $this->db->prepare($sql);
                $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
                $stmt->execute();
            } else {
                $stmt = $this->db->query($sql);
            }
    
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Server error']);
        }
    }

    public function showService($params) {
        $id = $params['id'] ?? null;
        if (!$id) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing service ID']);
            return;
        }

        try {
            $stmt = $this->db->prepare("SELECT * FROM services WHERE id = ? AND is_active = 1");
            $stmt->execute([$id]);
            $service = $stmt->fetch();

            if ($service) {
                echo json_encode($service);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Service not found']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Server error']);
        }
    }

    // ==========================================
    // PARTE 5: CASOS DE ÉXITO (Anterior SuccessCaseController)
    // ==========================================
    public function indexSuccessCases() {
        try {
            $limit = isset($_GET['limit']) ? (int) $_GET['limit'] : null;
            $featured = isset($_GET['featured']) ? (int) $_GET['featured'] : null;

            $sql = "SELECT * FROM success_cases WHERE visible = 1";

            if ($featured === 1) {
                $sql .= " AND featured = 1";
            }

            $sql .= " ORDER BY display_order ASC, created_at DESC";

            if ($limit && $limit > 0) {
                $sql .= " LIMIT :limit";
                $stmt = $this->db->prepare($sql);
                $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
                $stmt->execute();
            } else {
                $stmt = $this->db->query($sql);
            }

            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error al cargar casos']);
        }
    }

    public function showSuccessCase($params) {
        $slug = $params['slug'] ?? null;

        if (!$slug) {
            http_response_code(400);
            echo json_encode(['error' => 'Slug requerido']);
            return;
        }

        $stmt = $this->db->prepare("SELECT * FROM success_cases WHERE slug = ? AND visible = 1 LIMIT 1");
        $stmt->execute([$slug]);
        $case = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$case) {
            http_response_code(404);
            echo json_encode(['error' => 'Caso no encontrado']);
            return;
        }

        echo json_encode($case);
    }
}
