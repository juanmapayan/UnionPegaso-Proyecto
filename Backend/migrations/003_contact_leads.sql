CREATE TABLE contact_leads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    lead_type ENUM('contact', 'quote') NOT NULL DEFAULT 'contact',
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    telefono VARCHAR(30) NULL,
    empresa VARCHAR(150) NULL,
    service_id INT NULL,
    budget_range VARCHAR(50) NULL,
    message TEXT NOT NULL,
    source_page VARCHAR(100) NULL,
    status ENUM('new', 'read', 'contacted', 'archived') NOT NULL DEFAULT 'new',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_contact_leads_service
        FOREIGN KEY (service_id) REFERENCES services(id)
        ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;