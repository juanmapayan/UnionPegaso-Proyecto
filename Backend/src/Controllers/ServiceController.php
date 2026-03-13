<?php

class ServiceController {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function index() {
        try {
            // Optional limit parameter for home page and other constrained listings
            $limit = null;
            if (isset($_GET['limit'])) {
                $limit = (int) $_GET['limit'];
                if ($limit <= 0) {
                    $limit = null;
                }
            }

            $sql = "SELECT * FROM services WHERE is_active = 1 ORDER BY display_order ASC, created_at DESC";
            if ($limit !== null) {
                // Use prepared statement when applying LIMIT to avoid SQL injection
                $sql .= " LIMIT :limit";
                $stmt = $this->db->prepare($sql);
                $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
                $stmt->execute();
            } else {
                $stmt = $this->db->query($sql);
            }

            $services = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($services);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Server error']);
        }
    }

    public function show($params) {
        $id = $params['id'] ?? null;
        if (!$id) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing service ID']);
            return;
        }

        try {
            $stmt = $this->db->prepare("SELECT * FROM services WHERE id = ?");
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
}
