<?php

class PurchaseController {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function create() {
        // Authenticate
        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            return;
        }

        $userId = $_SESSION['user_id'];
        $data = json_decode(file_get_contents('php://input'), true);
        
        $items = $data['items'] ?? [];

        if (empty($items)) {
            http_response_code(400);
            echo json_encode(['error' => 'No items in purchase']);
            return;
        }

        try {
            $this->db->beginTransaction();

            $total = 0;
            $purchaseItems = [];

            // Calculate total and validate items
            foreach ($items as $item) {
                $serviceId = $item['service_id'];
                $quantity = $item['quantity'] ?? 1;

                $stmt = $this->db->prepare("SELECT precio FROM services WHERE id = ?");
                $stmt->execute([$serviceId]);
                $service = $stmt->fetch();

                if (!$service) {
                    throw new Exception("Service ID $serviceId not found");
                }

                $price = $service['precio'];
                $subtotal = $price * $quantity;
                $total += $subtotal;

                $purchaseItems[] = [
                    'service_id' => $serviceId,
                    'quantity' => $quantity,
                    'price' => $price,
                    'subtotal' => $subtotal
                ];
            }

            // Create purchase
            $stmt = $this->db->prepare("INSERT INTO purchases (id_usuario, total, fecha) VALUES (?, ?, NOW())");
            $stmt->execute([$userId, $total]);
            $purchaseId = $this->db->lastInsertId();

            // Create purchase items
            $stmt = $this->db->prepare("INSERT INTO purchase_items (id_compra, id_servicio, cantidad, precio_unitario, subtotal) VALUES (?, ?, ?, ?, ?)");
            foreach ($purchaseItems as $pItem) {
                $stmt->execute([$purchaseId, $pItem['service_id'], $pItem['quantity'], $pItem['price'], $pItem['subtotal']]);
            }

            $this->db->commit();
            
            http_response_code(201);
            echo json_encode(['message' => 'Purchase created successfully', 'purchase_id' => $purchaseId]);

        } catch (Exception $e) {
            $this->db->rollBack();
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }
}
