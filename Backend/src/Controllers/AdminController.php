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

        // Basic validation: title required and price required & non-negative numeric
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
            $stmt = $this->db->prepare("INSERT INTO services (title, description, price, is_active, display_order) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([$title, $description, (float) $price, $is_active, $display_order]);
            
            $id = (int) $this->db->lastInsertId();

            http_response_code(201);
            echo json_encode([
                'id' => $id,
                'title' => $title,
                'description' => $description,
                'price' => (float) $price,
                'is_active' => (bool) $is_active,
                'display_order' => (int) $display_order,
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error al crear servicio: ' . $e->getMessage()]);
        }
    }

    public function updateService($id) {
        $this->requireAdmin();

        $data = json_decode(file_get_contents('php://input'), true);
        
        // We will update only provided fields
        $fields = [];
        $params = [];

        if (isset($data['title'])) { $fields[] = 'title = ?'; $params[] = $data['title']; }
        if (isset($data['description'])) { $fields[] = 'description = ?'; $params[] = $data['description']; }
        if (isset($data['price'])) { $fields[] = 'price = ?'; $params[] = (float) $data['price']; }
        if (isset($data['is_active'])) { $fields[] = 'is_active = ?'; $params[] = $data['is_active'] ? 1 : 0; }
        if (isset($data['display_order'])) { $fields[] = 'display_order = ?'; $params[] = (int) $data['display_order']; }

        if (empty($fields)) {
            http_response_code(400);
            echo json_encode(['error' => 'No hay datos para actualizar']);
            return;
        }

        try {
            $sql = "UPDATE services SET " . implode(', ', $fields) . " WHERE id = ?";
            $params[] = $id;
            
            $stmt = $this->db->prepare($sql);
            $stmt->execute($params);

            // Return updated service in canonical structure
            $fetchStmt = $this->db->prepare("SELECT * FROM services WHERE id = ?");
            $fetchStmt->execute([$id]);
            $service = $fetchStmt->fetch(PDO::FETCH_ASSOC);

            if ($service) {
                echo json_encode($service);
            } else {
                echo json_encode(['message' => 'Servicio actualizado']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error al actualizar servicio: ' . $e->getMessage()]);
        }
    }

    public function deleteService($id) {
        $this->requireAdmin();

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

        if (empty($title)) {
            http_response_code(400);
            echo json_encode(['error' => 'El título es obligatorio']);
            return;
        }

        try {
            $stmt = $this->db->prepare("INSERT INTO success_cases (title, description, client, image_url, visible) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([$title, $description, $client, $image_url, $visible]);
            
            http_response_code(201);
            echo json_encode(['message' => 'Caso de éxito creado', 'id' => $this->db->lastInsertId()]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error al crear caso: ' . $e->getMessage()]);
        }
    }

    public function updateCase($id) {
        $this->requireAdmin();

        $data = json_decode(file_get_contents('php://input'), true);

        $fields = [];
        $params = [];

        if (isset($data['title'])) { $fields[] = 'title = ?'; $params[] = $data['title']; }
        if (isset($data['description'])) { $fields[] = 'description = ?'; $params[] = $data['description']; }
        if (isset($data['client'])) { $fields[] = 'client = ?'; $params[] = $data['client']; }
        if (isset($data['image_url'])) { $fields[] = 'image_url = ?'; $params[] = $data['image_url']; }
        if (isset($data['visible'])) { $fields[] = 'visible = ?'; $params[] = $data['visible']; }

        if (empty($fields)) {
            http_response_code(400);
            echo json_encode(['error' => 'No hay datos para actualizar']);
            return;
        }

        try {
            $sql = "UPDATE success_cases SET " . implode(', ', $fields) . " WHERE id = ?";
            $params[] = $id;
            
            $stmt = $this->db->prepare($sql);
            $stmt->execute($params);

            echo json_encode(['message' => 'Caso actualizado']);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Error al actualizar caso: ' . $e->getMessage()]);
        }
    }

    public function deleteCase($id) {
        $this->requireAdmin();

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
            
            // Check if invoice exists
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
            // Check if exists
            $stmt = $this->db->prepare("SELECT id FROM invoices WHERE order_id = ?");
            $stmt->execute([$orderId]);
            if ($stmt->fetch()) {
                http_response_code(409);
                echo json_encode(['error' => 'La factura ya existe para este pedido']);
                return;
            }

            // Generate Invoice Number (YYYY-XXXX)
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

            // Create Invoice
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
            
            // Header
            $pdf->SetFont('Arial', 'B', 16);
            $pdf->Cell(0, 10, utf8_decode('Unión Pegaso - Factura'), 0, 1, 'C');
            
            $pdf->SetFont('Arial', '', 12);
            $pdf->Cell(0, 10, utf8_decode('N° Factura: ' . $data['invoice_number']), 0, 1, 'R');
            $pdf->Cell(0, 10, 'Fecha: ' . $data['created_at'], 0, 1, 'R');
            
            $pdf->Ln(10);
            
            // Client Info
            $pdf->SetFont('Arial', 'B', 12);
            $pdf->Cell(0, 10, 'Cliente:', 0, 1);
            $pdf->SetFont('Arial', '', 12);
            $pdf->Cell(0, 10, utf8_decode('Nombre: ' . ($data['customer_nombre'] ?? 'N/A')), 0, 1);
            $pdf->Cell(0, 10, 'Email: ' . ($data['customer_email'] ?? 'N/A'), 0, 1);
            
            $pdf->Ln(10);
            
            // Items Table
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
}
