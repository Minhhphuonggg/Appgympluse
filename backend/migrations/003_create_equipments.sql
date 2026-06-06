CREATE TABLE IF NOT EXISTS equipments (
  id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT 'ID thiet bi',
  name VARCHAR(255) NOT NULL COMMENT 'Ten may',
  brand VARCHAR(255) NULL COMMENT 'Thuong hieu',
  quantity INT NOT NULL DEFAULT 0 COMMENT 'So luong',
  size VARCHAR(100) NULL COMMENT 'Kich thuoc',
  weight_kg DECIMAL(10,2) NULL COMMENT 'Can nang (kg)',
  image_url TEXT NULL COMMENT 'Hinh anh thiet bi',
  condition_status ENUM('good', 'maintenance', 'broken') DEFAULT 'good' COMMENT 'Tinh trang thiet bi',
  created_by BIGINT NULL COMMENT 'ID admin tao/cap nhat',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Thoi gian tao',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Thoi gian cap nhat',
  CONSTRAINT fk_equipments_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_equipments_condition (condition_status),
  INDEX idx_equipments_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
