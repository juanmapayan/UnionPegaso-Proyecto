<?php

class InvoiceController {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function index() {
        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            return;
        }

        $userId = $_SESSION['user_id'];

        try {
            $stmt = $this->db->prepare("SELECT * FROM purchases WHERE id_usuario = ? ORDER BY fecha DESC");
            $stmt->execute([$userId]);
            $invoices = $stmt->fetchAll();
            echo json_encode($invoices);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Server error']);
        }
    }

    public function show($params) {
        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            return;
        }

        $userId = $_SESSION['user_id'];
        $purchaseId = $params['id'] ?? null;

        if (!$purchaseId) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing invoice ID']);
            return;
        }

        try {
            // Get Purchase
            $stmt = $this->db->prepare("SELECT * FROM purchases WHERE id = ? AND id_usuario = ?");
            $stmt->execute([$purchaseId, $userId]);
            $purchase = $stmt->fetch();

            if (!$purchase) {
                http_response_code(404);
                echo json_encode(['error' => 'Invoice not found']);
                return;
            }

            // Get Items with Service names
            $stmt = $this->db->prepare("
                SELECT pi.*, s.nombre as nombre_servicio 
                FROM purchase_items pi 
                JOIN services s ON pi.id_servicio = s.id 
                WHERE pi.id_compra = ?
            ");
            $stmt->execute([$purchaseId]);
            $items = $stmt->fetchAll();

            $purchase['items'] = $items;
            echo json_encode($purchase);

        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Server error']);
        }
    }
}
