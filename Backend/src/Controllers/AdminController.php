<?php

class AdminController {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    private function requireAdmin() {
        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(['error' => 'No autenticado']);
            exit;
        }

        $stmt = $this->db->prepare("SELECT rol FROM users WHERE id = ?");
        $stmt->execute([$_SESSION['user_id']]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user || $user['rol'] !== 'admin') {
            http_response_code(403);
            echo json_encode(['error' => 'Acceso denegado: Se requieren permisos de administrador']);
            exit;
        }
    }

    // --- Services CRUD ---

    public function indexServices() {
        $this->requireAdmin();
        
        $stmt = $this->db->query("SELECT * FROM services ORDER BY display_order ASC, created_at DESC");
        $services = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode($services);
    }

    public function createService() {
        $this->requireAdmin();

        $data = json_decode(file_get_contents('php://input'), true);
        
        $title = $data['title'] ?? '';
        $description = $data['description'] ?? '';
        $price = $data['price'] ?? null;
        $is_active = $data['is_active'] ?? 1;
        $display_order = $data['display_order'] ?? 0;
        $icon_key = trim($data['icon_key'] ?? '') ?: null;
        $featured = !empty($data['featured']) ? 1 : 0;

        // Validación básica: título requerido y precio requerido y numérico no negativo
        if ($title === '' || $title === null) {
            http_response_code(400);
            echo json_encode(['error' => 'El título es obligatorio']);
            return;
        }

        if ($price === null || $price === '' || !is_numeric($price) || (float) $price < 0) {
            http_response_code(400);
            echo json_encode(['error' => 'El precio es obligatorio y debe ser un número válido mayor o igual a 0']);
            return;
        }

        try {
            $slug = $this->slugify($title);
        
            $stmt = $this->db->prepare("
                INSERT INTO services (title, slug, description, price, icon_key, is_active, featured, display_order)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ");
            $stmt->execute([
                $title,
                $slug,
                $description,
                (float) $price,
                $icon_key,
                $is_active ? 1 : 0,
                $featured,
                (int) $display_order
            ]);
            
            $id = (int) $this->db->lastInsertId();
        
            http_response_code(201);
            echo json_encode([
                'id' => $id,
                'title' => $title,
                'slug' => $slug,
                'description' => $description,
                'price' => (float) $price,
                'icon_key' => $icon_key,
                'featured' => (bool) $featured,
                'is_active' => (bool) $is_active,
                'display_order' => (int) $display_order,
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error al crear servicio: ' . $e->getMessage()]);
        }
    }

    public function updateService($params) {
        $this->requireAdmin();
    
        $id = isset($params['id']) ? (int) $params['id'] : 0;
        if ($id <= 0) {
            http_response_code(400);
            echo json_encode(['error' => 'ID de servicio no válido']);
            return;
        }
    
        $data = json_decode(file_get_contents('php://input'), true);
    
        $fields = [];
        $values = [];
    
        if (isset($data['title'])) {
            $title = trim($data['title']);
            $fields[] = 'title = ?';
            $values[] = $title;
    
            $fields[] = 'slug = ?';
            $values[] = $this->slugify($title);
        }
    
        if (isset($data['description'])) {
            $fields[] = 'description = ?';
            $values[] = trim($data['description'] ?? '');
        }
    
        if (isset($data['price'])) {
            if ($data['price'] === '' || !is_numeric($data['price']) || (float) $data['price'] < 0) {
                http_response_code(400);
                echo json_encode(['error' => 'El precio debe ser un número válido mayor o igual a 0']);
                return;
            }
            $fields[] = 'price = ?';
            $values[] = (float) $data['price'];
        }
    
        if (isset($data['is_active'])) {
            $fields[] = 'is_active = ?';
            $values[] = $data['is_active'] ? 1 : 0;
        }
    
        if (isset($data['display_order'])) {
            $fields[] = 'display_order = ?';
            $values[] = (int) $data['display_order'];
        }

        if (isset($data['icon_key'])) {
            $fields[] = 'icon_key = ?';
            $values[] = trim($data['icon_key'] ?? '') ?: null;
        }

        if (isset($data['featured'])) {
            $fields[] = 'featured = ?';
            $values[] = $data['featured'] ? 1 : 0;
        }

        if (empty($fields)) {
            http_response_code(400);
            echo json_encode(['error' => 'No hay datos para actualizar']);
            return;
        }

        try {
            $sql = "UPDATE services SET " . implode(', ', $fields) . " WHERE id = ?";
            $values[] = $id;
    
            $stmt = $this->db->prepare($sql);
            $stmt->execute($values);
    
            $fetchStmt = $this->db->prepare("SELECT * FROM services WHERE id = ?");
            $fetchStmt->execute([$id]);
            $service = $fetchStmt->fetch(PDO::FETCH_ASSOC);
    
            echo json_encode($service ?: ['message' => 'Servicio actualizado']);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error al actualizar servicio: ' . $e->getMessage()]);
        }
    }

    public function deleteService($params) {
        $this->requireAdmin();
    
        $id = isset($params['id']) ? (int) $params['id'] : 0;
        if ($id <= 0) {
            http_response_code(400);
            echo json_encode(['error' => 'ID de servicio no válido']);
            return;
        }
    
        try {
            $stmt = $this->db->prepare("DELETE FROM services WHERE id = ?");
            $stmt->execute([$id]);
    
            echo json_encode(['message' => 'Servicio eliminado']);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error al eliminar servicio: ' . $e->getMessage()]);
        }
    }

    // --- Success Cases CRUD ---

    public function indexCases() {
        $this->requireAdmin();
        
        $stmt = $this->db->query("SELECT * FROM success_cases ORDER BY created_at DESC");
        $cases = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode($cases);
    }

    public function createCase() {
        $this->requireAdmin();

        $data = json_decode(file_get_contents('php://input'), true);
        
        $title = $data['title'] ?? '';
        $description = $data['description'] ?? '';
        $client = $data['client'] ?? '';
        $image_url = $data['image_url'] ?? '';
        $visible = $data['visible'] ?? 1;
        $category = trim($data['category'] ?? '') ?: null;
        $excerpt = trim($data['excerpt'] ?? '') ?: null;
        $metric_value = trim($data['metric_value'] ?? '') ?: null;
        $metric_label = trim($data['metric_label'] ?? '') ?: null;
        $featured_case = !empty($data['featured']) ? 1 : 0;
        $display_order_case = (int) ($data['display_order'] ?? 0);

        if (empty($title)) {
            http_response_code(400);
            echo json_encode(['error' => 'El título es obligatorio']);
            return;
        }

        try {
            $slug = $this->slugify($title);
        
            $stmt = $this->db->prepare("
                INSERT INTO success_cases (title, slug, description, client, image_url, visible, category, excerpt, metric_value, metric_label, featured, display_order)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");

            $stmt->execute([
                $title,
                $slug,
                $description,
                $client ?: null,
                $image_url ?: null,
                $visible ? 1 : 0,
                $category,
                $excerpt,
                $metric_value,
                $metric_label,
                $featured_case,
                $display_order_case
            ]);
        
            $id = (int) $this->db->lastInsertId();
        
            http_response_code(201);
            echo json_encode([
                'id' => $id,
                'title' => $title,
                'slug' => $slug,
                'description' => $description,
                'client' => $client ?: null,
                'image_url' => $image_url ?: null,
                'visible' => (bool) $visible,
                'category' => $category,
                'excerpt' => $excerpt,
                'metric_value' => $metric_value,
                'metric_label' => $metric_label,
                'featured' => (bool) $featured_case,
                'display_order' => $display_order_case,
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'No se pudo crear el caso']);
        }
    }

    public function updateCase($params) {
        $this->requireAdmin();
    
        $id = isset($params['id']) ? (int) $params['id'] : 0;
        if ($id <= 0) {
            http_response_code(400);
            echo json_encode(['error' => 'ID de caso no válido']);
            return;
        }
    
        $data = json_decode(file_get_contents('php://input'), true);
    
        $fields = [];
        $values = [];
    
        if (isset($data['title'])) {
            $title = trim($data['title']);
            $fields[] = 'title = ?';
            $values[] = $title;
    
            $fields[] = 'slug = ?';
            $values[] = $this->slugify($title);
        }
    
        if (isset($data['description'])) {
            $fields[] = 'description = ?';
            $values[] = trim($data['description'] ?? '');
        }
    
        if (isset($data['client'])) {
            $fields[] = 'client = ?';
            $values[] = trim($data['client'] ?? '');
        }
    
        if (isset($data['image_url'])) {
            $fields[] = 'image_url = ?';
            $values[] = trim($data['image_url'] ?? '');
        }
    
        if (isset($data['visible'])) {
            $fields[] = 'visible = ?';
            $values[] = $data['visible'] ? 1 : 0;
        }

        if (isset($data['category'])) {
            $fields[] = 'category = ?';
            $values[] = trim($data['category'] ?? '') ?: null;
        }

        if (isset($data['excerpt'])) {
            $fields[] = 'excerpt = ?';
            $values[] = trim($data['excerpt'] ?? '') ?: null;
        }

        if (isset($data['metric_value'])) {
            $fields[] = 'metric_value = ?';
            $values[] = trim($data['metric_value'] ?? '') ?: null;
        }

        if (isset($data['metric_label'])) {
            $fields[] = 'metric_label = ?';
            $values[] = trim($data['metric_label'] ?? '') ?: null;
        }

        if (isset($data['featured'])) {
            $fields[] = 'featured = ?';
            $values[] = $data['featured'] ? 1 : 0;
        }

        if (isset($data['display_order'])) {
            $fields[] = 'display_order = ?';
            $values[] = (int) $data['display_order'];
        }

        if (empty($fields)) {
            http_response_code(400);
            echo json_encode(['error' => 'No hay datos para actualizar']);
            return;
        }

        try {
            $sql = "UPDATE success_cases SET " . implode(', ', $fields) . " WHERE id = ?";
            $values[] = $id;
    
            $stmt = $this->db->prepare($sql);
            $stmt->execute($values);
    
            $fetchStmt = $this->db->prepare("SELECT * FROM success_cases WHERE id = ?");
            $fetchStmt->execute([$id]);
            $case = $fetchStmt->fetch(PDO::FETCH_ASSOC);
    
            echo json_encode($case ?: ['message' => 'Caso actualizado']);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error al actualizar caso: ' . $e->getMessage()]);
        }
    }

    public function deleteCase($params) {
        $this->requireAdmin();
    
        $id = isset($params['id']) ? (int) $params['id'] : 0;
        if ($id <= 0) {
            http_response_code(400);
            echo json_encode(['error' => 'ID de caso no válido']);
            return;
        }
    
        try {
            $stmt = $this->db->prepare("DELETE FROM success_cases WHERE id = ?");
            $stmt->execute([$id]);
    
            echo json_encode(['message' => 'Caso eliminado']);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error al eliminar caso: ' . $e->getMessage()]);
        }
    }
    // --- Orders CRUD ---

    public function indexOrders() {
        $this->requireAdmin();

        $status = $_GET['status'] ?? '';
        $q = $_GET['q'] ?? '';
        $dateFrom = $_GET['date_from'] ?? '';
        $dateTo = $_GET['date_to'] ?? '';
        
        $sql = "SELECT o.*, u.email as user_email, u.nombre as user_nombre 
                FROM orders o 
                LEFT JOIN users u ON o.user_id = u.id 
                WHERE 1=1";
        $params = [];

        if (!empty($status)) {
            $sql .= " AND o.status = ?";
            $params[] = $status;
        }

        if (!empty($q)) {
            $sql .= " AND (o.id = ? OR o.customer_email LIKE ? OR o.customer_nombre LIKE ?)";
            $params[] = $q;
            $params[] = "%$q%";
            $params[] = "%$q%";
        }

        if (!empty($dateFrom)) {
            $sql .= " AND o.created_at >= ?";
            $params[] = $dateFrom . " 00:00:00";
        }

        if (!empty($dateTo)) {
            $sql .= " AND o.created_at <= ?";
            $params[] = $dateTo . " 23:59:59";
        }

        $sql .= " ORDER BY o.created_at DESC";

        try {
            $stmt = $this->db->prepare($sql);
            $stmt->execute($params);
            $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($orders);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error al obtener pedidos: ' . $e->getMessage()]);
        }
    }

    public function showOrder($id) {
        $this->requireAdmin();

        try {
            $stmt = $this->db->prepare("SELECT * FROM orders WHERE id = ?");
            $stmt->execute([$id]);
            $order = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$order) {
                http_response_code(404);
                echo json_encode(['error' => 'Pedido no encontrado']);
                return;
            }

            $stmtItems = $this->db->prepare("SELECT * FROM order_items WHERE order_id = ?");
            $stmtItems->execute([$id]);
            $order['items'] = $stmtItems->fetchAll(PDO::FETCH_ASSOC);
            
            // Verificar si la factura existe
            $stmtInvoice = $this->db->prepare("SELECT * FROM invoices WHERE order_id = ?");
            $stmtInvoice->execute([$id]);
            $order['invoice'] = $stmtInvoice->fetch(PDO::FETCH_ASSOC);

            echo json_encode($order);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error al obtener pedido: ' . $e->getMessage()]);
        }
    }

    public function updateOrderStatus($id) {
        $this->requireAdmin();
        $data = json_decode(file_get_contents('php://input'), true);
        $status = $data['status'] ?? '';

        $allowedStatuses = ['pending', 'paid', 'cancelled', 'completed'];
        if (!in_array($status, $allowedStatuses)) {
            http_response_code(400);
            echo json_encode(['error' => 'Estado inválido']);
            return;
        }

        try {
            $stmt = $this->db->prepare("UPDATE orders SET status = ? WHERE id = ?");
            $stmt->execute([$status, $id]);
            echo json_encode(['message' => 'Estado actualizado']);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error al actualizar pedido: ' . $e->getMessage()]);
        }
    }

    // --- Invoices ---

    public function indexInvoices() {
        $this->requireAdmin();
        
        try {
            $sql = "SELECT i.*, o.total, o.currency, o.customer_nombre, o.customer_email 
                    FROM invoices i
                    JOIN orders o ON i.order_id = o.id
                    ORDER BY i.created_at DESC";
            $stmt = $this->db->query($sql);
            $invoices = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($invoices);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error al listar facturas: ' . $e->getMessage()]);
        }
    }

    public function createInvoice() {
        $this->requireAdmin();
        $data = json_decode(file_get_contents('php://input'), true);
        $orderId = $data['order_id'] ?? null;

        if (!$orderId) {
            http_response_code(400);
            echo json_encode(['error' => 'ID de pedido requerido']);
            return;
        }

        try {
            // Verificar si existe
            $stmt = $this->db->prepare("SELECT id FROM invoices WHERE order_id = ?");
            $stmt->execute([$orderId]);
            if ($stmt->fetch()) {
                http_response_code(409);
                echo json_encode(['error' => 'La factura ya existe para este pedido']);
                return;
            }

            // Generar número de factura (YYYY-XXXX)
            $year = date('Y');
            $stmt = $this->db->prepare("SELECT invoice_number FROM invoices WHERE invoice_number LIKE ? ORDER BY id DESC LIMIT 1");
            $stmt->execute(["$year-%"]);
            $lastInvoice = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($lastInvoice) {
                $parts = explode('-', $lastInvoice['invoice_number']);
                $sequence = intval($parts[1]) + 1;
            } else {
                $sequence = 1;
            }
            $invoiceNumber = $year . '-' . str_pad($sequence, 4, '0', STR_PAD_LEFT);

            // Crear factura
            $stmt = $this->db->prepare("INSERT INTO invoices (order_id, invoice_number) VALUES (?, ?)");
            $stmt->execute([$orderId, $invoiceNumber]);
            $invoiceId = $this->db->lastInsertId();

            echo json_encode(['message' => 'Factura creada', 'id' => $invoiceId, 'invoice_number' => $invoiceNumber]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error al generar factura: ' . $e->getMessage()]);
        }
    }

    public function downloadInvoicePdf($id) {
        $this->requireAdmin();

        try {
            $stmt = $this->db->prepare("SELECT i.*, o.* FROM invoices i JOIN orders o ON i.order_id = o.id WHERE i.id = ?");
            $stmt->execute([$id]);
            $data = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$data) {
                http_response_code(404);
                echo json_encode(['error' => 'Factura no encontrada']);
                return;
            }

            $stmtItems = $this->db->prepare("SELECT * FROM order_items WHERE order_id = ?");
            $stmtItems->execute([$data['order_id']]);
            $items = $stmtItems->fetchAll(PDO::FETCH_ASSOC);

            if (!class_exists('FPDF')) {
                require_once __DIR__ . '/../lib/fpdf.php';
            }

            $pdf = new FPDF();
            $pdf->AddPage();
            
            // Encabezado
            $pdf->SetFont('Arial', 'B', 16);
            $pdf->Cell(0, 10, utf8_decode('Unión Pegaso - Factura'), 0, 1, 'C');
            
            $pdf->SetFont('Arial', '', 12);
            $pdf->Cell(0, 10, utf8_decode('N° Factura: ' . $data['invoice_number']), 0, 1, 'R');
            $pdf->Cell(0, 10, 'Fecha: ' . $data['created_at'], 0, 1, 'R');
            
            $pdf->Ln(10);
            
            // Información del cliente
            $pdf->SetFont('Arial', 'B', 12);
            $pdf->Cell(0, 10, 'Cliente:', 0, 1);
            $pdf->SetFont('Arial', '', 12);
            $pdf->Cell(0, 10, utf8_decode('Nombre: ' . ($data['customer_nombre'] ?? 'N/A')), 0, 1);
            $pdf->Cell(0, 10, 'Email: ' . ($data['customer_email'] ?? 'N/A'), 0, 1);
            
            $pdf->Ln(10);
            
            // Tabla de artículos
            $pdf->SetFont('Arial', 'B', 12);
            $pdf->Cell(100, 10, utf8_decode('Descripción'), 1);
            $pdf->Cell(30, 10, 'Cant.', 1);
            $pdf->Cell(30, 10, 'Precio', 1);
            $pdf->Cell(30, 10, 'Total', 1);
            $pdf->Ln();
            
            $pdf->SetFont('Arial', '', 12);
            foreach ($items as $item) {
                $totalItem = $item['quantity'] * $item['price_snapshot'];
                $pdf->Cell(100, 10, utf8_decode($item['name_snapshot']), 1);
                $pdf->Cell(30, 10, $item['quantity'], 1);
                $pdf->Cell(30, 10, number_format($item['price_snapshot'], 2) . ' ' . $data['currency'], 1);
                $pdf->Cell(30, 10, number_format($totalItem, 2) . ' ' . $data['currency'], 1);
                $pdf->Ln();
            }
            
            // Total
            $pdf->Ln(5);
            $pdf->SetFont('Arial', 'B', 12);
            $pdf->Cell(130, 10, '', 0);
            $pdf->Cell(30, 10, 'Total:', 1);
            $pdf->Cell(30, 10, number_format($data['total'], 2) . ' ' . $data['currency'], 1);

            $pdf->Output('D', 'factura_' . $data['invoice_number'] . '.pdf');
            exit;

        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error al generar PDF: ' . $e->getMessage()]);
        }
    }

    // --- Reviews Management ---

    public function indexReviews() {
        $this->requireAdmin();

        $status = $_GET['status'] ?? '';
        $q = $_GET['q'] ?? '';
        
        $sql = "SELECT r.*, u.email as user_email_registered 
                FROM reviews r 
                LEFT JOIN users u ON r.user_id = u.id 
                WHERE 1=1";
        $params = [];

        if (!empty($status)) {
            $sql .= " AND r.status = ?";
            $params[] = $status;
        }

        if (!empty($q)) {
            $sql .= " AND (r.author_name LIKE ? OR r.author_email LIKE ? OR r.comment LIKE ?)";
            $params[] = "%$q%";
            $params[] = "%$q%";
            $params[] = "%$q%";
        }

        $sql .= " ORDER BY r.created_at DESC";

        try {
            $stmt = $this->db->prepare($sql);
            $stmt->execute($params);
            $reviews = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($reviews);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error al listar reseñas: ' . $e->getMessage()]);
        }
    }

    public function showReview($id) {
        $this->requireAdmin();

        try {
            $stmt = $this->db->prepare("SELECT r.*, u.email as user_email_registered FROM reviews r LEFT JOIN users u ON r.user_id = u.id WHERE r.id = ?");
            $stmt->execute([$id]);
            $review = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$review) {
                http_response_code(404);
                echo json_encode(['error' => 'Reseña no encontrada']);
                return;
            }

            echo json_encode($review);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error al obtener reseña: ' . $e->getMessage()]);
        }
    }

    public function updateReviewStatus($id) {
        $this->requireAdmin();
        $data = json_decode(file_get_contents('php://input'), true);
        $status = $data['status'] ?? '';

        if (!in_array($status, ['approved', 'hidden', 'pending'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Estado inválido']);
            return;
        }

        try {
            $stmt = $this->db->prepare("UPDATE reviews SET status = ? WHERE id = ?");
            $stmt->execute([$status, $id]);
            echo json_encode(['message' => 'Estado de reseña actualizado']);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error al actualizar reseña: ' . $e->getMessage()]);
        }
    }

    public function deleteReview($id) {
        $this->requireAdmin();

        try {
            $stmt = $this->db->prepare("DELETE FROM reviews WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(['message' => 'Reseña eliminada permanentemente']);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error al eliminar reseña: ' . $e->getMessage()]);
        }
    }
    // --- Leads Management ---

    public function indexLeads() {
        $this->requireAdmin();

        try {
            $stmt = $this->db->query("
                SELECT cl.*, s.title as service_name
                FROM contact_leads cl
                LEFT JOIN services s ON cl.service_id = s.id
                ORDER BY cl.created_at DESC
            ");
            $leads = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($leads);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error al listar leads: ' . $e->getMessage()]);
        }
    }

    public function updateLeadStatus($params) {
        $this->requireAdmin();

        $id = isset($params['id']) ? (int) $params['id'] : 0;
        if ($id <= 0) {
            http_response_code(400);
            echo json_encode(['error' => 'ID de lead no válido']);
            return;
        }

        $data = json_decode(file_get_contents('php://input'), true);
        $status = $data['status'] ?? '';

        $allowed = ['new', 'read', 'contacted', 'archived'];
        if (!in_array($status, $allowed)) {
            http_response_code(400);
            echo json_encode(['error' => 'Estado no válido']);
            return;
        }

        try {
            $stmt = $this->db->prepare("UPDATE contact_leads SET status = ?, updated_at = NOW() WHERE id = ?");
            $stmt->execute([$status, $id]);

            if ($stmt->rowCount() === 0) {
                http_response_code(404);
                echo json_encode(['error' => 'Lead no encontrado']);
                return;
            }

            echo json_encode(['success' => true, 'message' => 'Estado actualizado']);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error al actualizar lead: ' . $e->getMessage()]);
        }
    }

    // --- Dashboard ---

    public function indexDashboard() {
        $this->requireAdmin();

        try {
            $services  = (int) $this->db->query("SELECT COUNT(*) FROM services WHERE is_active = 1")->fetchColumn();
            $cases     = (int) $this->db->query("SELECT COUNT(*) FROM success_cases WHERE visible = 1")->fetchColumn();
            $portfolio = (int) $this->db->query("SELECT COUNT(*) FROM portfolio_items WHERE visible = 1")->fetchColumn();
            $leads     = (int) $this->db->query("SELECT COUNT(*) FROM contact_leads")->fetchColumn();

            $recentLeads = $this->db->query("
                SELECT id, lead_type, nombre, email, status, created_at
                FROM contact_leads
                ORDER BY created_at DESC
                LIMIT 5
            ")->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode([
                'services'     => $services,
                'cases'        => $cases,
                'portfolio'    => $portfolio,
                'leads'        => $leads,
                'recent_leads' => $recentLeads,
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error al cargar dashboard: ' . $e->getMessage()]);
        }
    }

    // --- Portfolio CRUD ---

    public function indexPortfolio() {
        $this->requireAdmin();

        try {
            $stmt = $this->db->query("SELECT * FROM portfolio_items ORDER BY display_order ASC, created_at DESC");
            $items = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($items);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error al listar portfolio: ' . $e->getMessage()]);
        }
    }

    public function createPortfolio() {
        $this->requireAdmin();

        $data = json_decode(file_get_contents('php://input'), true);

        $title     = trim($data['title'] ?? '');
        $type      = $data['type'] ?? 'image';
        $media_url = trim($data['media_url'] ?? '');

        if ($title === '') {
            http_response_code(400);
            echo json_encode(['error' => 'El título es obligatorio']);
            return;
        }

        if (!in_array($type, ['image', 'video'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Tipo no válido (image o video)']);
            return;
        }

        if ($media_url === '') {
            http_response_code(400);
            echo json_encode(['error' => 'La URL del medio es obligatoria']);
            return;
        }

        try {
            $slug        = $this->slugify($title);
            $poster_url  = trim($data['poster_url'] ?? '') ?: null;
            $orientation = in_array($data['orientation'] ?? '', ['horizontal','vertical','square']) ? $data['orientation'] : 'horizontal';
            $category    = trim($data['category'] ?? '') ?: null;
            $description = trim($data['description'] ?? '') ?: null;
            $year        = !empty($data['year']) ? (int) $data['year'] : null;
            $featured    = !empty($data['featured']) ? 1 : 0;
            $visible     = isset($data['visible']) ? ($data['visible'] ? 1 : 0) : 1;
            $display_order = (int) ($data['display_order'] ?? 0);

            $stmt = $this->db->prepare("
                INSERT INTO portfolio_items
                (title, slug, type, media_url, poster_url, orientation, category, description, year, featured, visible, display_order)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");
            $stmt->execute([
                $title, $slug, $type, $media_url, $poster_url, $orientation,
                $category, $description, $year, $featured, $visible, $display_order
            ]);

            $id = (int) $this->db->lastInsertId();

            http_response_code(201);
            echo json_encode(['id' => $id, 'title' => $title, 'slug' => $slug, 'type' => $type, 'media_url' => $media_url, 'visible' => (bool) $visible]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error al crear item de portfolio: ' . $e->getMessage()]);
        }
    }

    public function updatePortfolio($params) {
        $this->requireAdmin();

        $id = isset($params['id']) ? (int) $params['id'] : 0;
        if ($id <= 0) {
            http_response_code(400);
            echo json_encode(['error' => 'ID no válido']);
            return;
        }

        $data   = json_decode(file_get_contents('php://input'), true);
        $fields = [];
        $values = [];

        if (isset($data['title'])) {
            $title    = trim($data['title']);
            $fields[] = 'title = ?';
            $values[] = $title;
            $fields[] = 'slug = ?';
            $values[] = $this->slugify($title);
        }
        if (isset($data['type']) && in_array($data['type'], ['image', 'video'])) {
            $fields[] = 'type = ?';
            $values[] = $data['type'];
        }
        if (isset($data['media_url'])) {
            $fields[] = 'media_url = ?';
            $values[] = trim($data['media_url']);
        }
        if (isset($data['poster_url'])) {
            $fields[] = 'poster_url = ?';
            $values[] = trim($data['poster_url']) ?: null;
        }
        if (isset($data['orientation']) && in_array($data['orientation'], ['horizontal','vertical','square'])) {
            $fields[] = 'orientation = ?';
            $values[] = $data['orientation'];
        }
        if (isset($data['category'])) {
            $fields[] = 'category = ?';
            $values[] = trim($data['category']) ?: null;
        }
        if (isset($data['description'])) {
            $fields[] = 'description = ?';
            $values[] = trim($data['description']) ?: null;
        }
        if (isset($data['year'])) {
            $fields[] = 'year = ?';
            $values[] = $data['year'] ? (int) $data['year'] : null;
        }
        if (isset($data['featured'])) {
            $fields[] = 'featured = ?';
            $values[] = $data['featured'] ? 1 : 0;
        }
        if (isset($data['visible'])) {
            $fields[] = 'visible = ?';
            $values[] = $data['visible'] ? 1 : 0;
        }
        if (isset($data['display_order'])) {
            $fields[] = 'display_order = ?';
            $values[] = (int) $data['display_order'];
        }

        if (empty($fields)) {
            http_response_code(400);
            echo json_encode(['error' => 'No hay datos para actualizar']);
            return;
        }

        try {
            $sql      = "UPDATE portfolio_items SET " . implode(', ', $fields) . " WHERE id = ?";
            $values[] = $id;
            $stmt     = $this->db->prepare($sql);
            $stmt->execute($values);

            $fetchStmt = $this->db->prepare("SELECT * FROM portfolio_items WHERE id = ?");
            $fetchStmt->execute([$id]);
            $item = $fetchStmt->fetch(PDO::FETCH_ASSOC);

            echo json_encode($item ?: ['message' => 'Item actualizado']);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error al actualizar portfolio: ' . $e->getMessage()]);
        }
    }

    public function deletePortfolio($params) {
        $this->requireAdmin();

        $id = isset($params['id']) ? (int) $params['id'] : 0;
        if ($id <= 0) {
            http_response_code(400);
            echo json_encode(['error' => 'ID no válido']);
            return;
        }

        try {
            $stmt = $this->db->prepare("DELETE FROM portfolio_items WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(['message' => 'Item eliminado']);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error al eliminar item de portfolio: ' . $e->getMessage()]);
        }
    }

    // --- Media Upload ---

    public function uploadMedia() {
        $this->requireAdmin();

        if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
            http_response_code(400);
            echo json_encode(['error' => 'No se recibió ningún archivo o hubo un error en la subida']);
            return;
        }

        $file = $_FILES['file'];

        $allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4'];
        $finfo = new finfo(FILEINFO_MIME_TYPE);
        $mime  = $finfo->file($file['tmp_name']);

        if (!in_array($mime, $allowedMimes)) {
            http_response_code(400);
            echo json_encode(['error' => 'Tipo de archivo no permitido. Usa JPG, PNG, WebP o MP4.']);
            return;
        }

        if ($file['size'] > 20 * 1024 * 1024) {
            http_response_code(400);
            echo json_encode(['error' => 'El archivo supera el límite de 20MB']);
            return;
        }

        $extensions = [
            'image/jpeg' => 'jpg',
            'image/png'  => 'png',
            'image/webp' => 'webp',
            'video/mp4'  => 'mp4',
        ];

        $ext       = $extensions[$mime];
        $filename  = uniqid('media_', true) . '.' . $ext;
        $uploadDir = __DIR__ . '/../../public/uploads/';

        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        if (!move_uploaded_file($file['tmp_name'], $uploadDir . $filename)) {
            http_response_code(500);
            echo json_encode(['error' => 'No se pudo guardar el archivo en el servidor']);
            return;
        }

        echo json_encode(['url' => '/uploads/' . $filename]);
    }

    private function slugify($text) {
        $text = strtolower(trim($text));
        $text = preg_replace('/[^a-z0-9]+/i', '-', $text);
        return trim($text, '-');
    }
}
