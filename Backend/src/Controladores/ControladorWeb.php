<?php

require_once __DIR__ . '/../BaseDatos.php';
require_once __DIR__ . '/../ResendMailer.php';

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

    public function indexServiceReviews($params) {
        $id = (int)($params['id'] ?? 0);
        if ($id <= 0) {
            http_response_code(400);
            echo json_encode(['error' => 'ID de servicio inválido']);
            return;
        }

        try {
            $stmt = $this->db->prepare("
                SELECT author_name, rating, comment, created_at
                FROM reviews
                WHERE service_id = ? AND status = 'approved'
                ORDER BY created_at DESC
            ");
            $stmt->execute([$id]);
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error al obtener reseñas']);
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

    // ==========================================
    // PARTE 6: PEDIDOS (Orders)
    // ==========================================
    public function createOrder() {
        $data = json_decode(file_get_contents('php://input'), true);

        // Validaciones
        $nombre = trim($data['customer_nombre'] ?? '');
        $email  = trim($data['customer_email']  ?? '');
        $telefono = trim($data['customer_telefono'] ?? '');
        $message  = trim($data['customer_message']  ?? '');
        $items    = $data['items'] ?? [];

        if ($nombre === '' || strlen($nombre) > 100) {
            http_response_code(400);
            echo json_encode(['error' => 'Nombre requerido (máx 100 caracteres)']);
            return;
        }
        if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 150) {
            http_response_code(400);
            echo json_encode(['error' => 'Email requerido y válido (máx 150 caracteres)']);
            return;
        }
        if (empty($items) || !is_array($items)) {
            http_response_code(400);
            echo json_encode(['error' => 'El pedido debe contener al menos un servicio']);
            return;
        }
        foreach ($items as $item) {
            if (empty($item['name_snapshot']) || !isset($item['price_snapshot']) || !is_numeric($item['price_snapshot']) || (float)$item['price_snapshot'] < 0) {
                http_response_code(400);
                echo json_encode(['error' => 'Cada item debe tener name_snapshot y price_snapshot numérico ≥ 0']);
                return;
            }
        }

        // Calcular totales en servidor (no confiar en el cliente)
        $subtotal = 0;
        foreach ($items as $item) {
            $qty = max(1, (int)($item['quantity'] ?? 1));
            $subtotal += (float)$item['price_snapshot'] * $qty;
        }
        $total = $subtotal;

        try {
            $this->db->beginTransaction();

            $stmt = $this->db->prepare("
                INSERT INTO orders (user_id, customer_nombre, customer_email, customer_telefono, customer_message, subtotal, total, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
            ");
            $userId = $_SESSION['user_id'] ?? null;
            $stmt->execute([
                $userId,
                $nombre,
                $email,
                $telefono ?: null,
                $message  ?: null,
                $subtotal,
                $total
            ]);
            $orderId = (int)$this->db->lastInsertId();

            $stmtItem = $this->db->prepare("
                INSERT INTO order_items (order_id, service_id, name_snapshot, price_snapshot, quantity, line_total)
                VALUES (?, ?, ?, ?, ?, ?)
            ");
            foreach ($items as $item) {
                $qty       = max(1, (int)($item['quantity'] ?? 1));
                $price     = (float)$item['price_snapshot'];
                $serviceId = isset($item['service_id']) ? (int)$item['service_id'] : null;
                $stmtItem->execute([
                    $orderId,
                    $serviceId ?: null,
                    $item['name_snapshot'],
                    $price,
                    $qty,
                    $price * $qty
                ]);
            }

            $this->db->commit();

        } catch (Exception $e) {
            $this->db->rollBack();
            http_response_code(500);
            echo json_encode(['error' => 'Error al crear el pedido. Inténtalo de nuevo.']);
            return;
        }

        // Email de confirmación — fallo silencioso (fuera de la transacción)
        try {
            $orderData = ['id' => $orderId, 'nombre' => $nombre, 'email' => $email, 'total' => $total];
            $itemsForEmail = array_map(function($item) {
                return [
                    'name_snapshot'  => $item['name_snapshot'],
                    'price_snapshot' => (float)$item['price_snapshot'],
                    'quantity'       => max(1, (int)($item['quantity'] ?? 1)),
                ];
            }, $items);
            ResendMailer::sendOrderConfirmation($orderData, $itemsForEmail);
        } catch (Exception $e) {
            // La orden ya está guardada; el fallo de email es silencioso
        }

        http_response_code(201);
        echo json_encode(['success' => true, 'order_id' => $orderId]);
    }
}
