CREATE TABLE success_cases (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    slug VARCHAR(180) NOT NULL UNIQUE,
    client VARCHAR(150) NULL,
    category VARCHAR(100) NULL,
    excerpt VARCHAR(255) NULL,
    description TEXT NULL,
    metric_value VARCHAR(50) NULL,
    metric_label VARCHAR(100) NULL,
    image_url VARCHAR(255) NULL,
    featured TINYINT(1) NOT NULL DEFAULT 0,
    visible TINYINT(1) NOT NULL DEFAULT 1,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE portfolio_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    slug VARCHAR(180) NOT NULL UNIQUE,
    type ENUM('image', 'video') NOT NULL DEFAULT 'image',
    media_url VARCHAR(255) NOT NULL,
    poster_url VARCHAR(255) NULL,
    orientation ENUM('horizontal', 'vertical', 'square') NOT NULL DEFAULT 'horizontal',
    category VARCHAR(100) NULL,
    description TEXT NULL,
    year SMALLINT NULL,
    featured TINYINT(1) NOT NULL DEFAULT 0,
    visible TINYINT(1) NOT NULL DEFAULT 1,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;