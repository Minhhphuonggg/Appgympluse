CREATE TABLE IF NOT EXISTS users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT 'ID nguoi dung',
  name VARCHAR(255) COMMENT 'Ten nguoi dung',
  email VARCHAR(255) UNIQUE COMMENT 'Email dang nhap',
  password VARCHAR(255) COMMENT 'Mat khau da ma hoa',
  role ENUM('admin', 'staff', 'user') DEFAULT 'user' COMMENT 'Vai tro',
  phone VARCHAR(20) COMMENT 'So dien thoai',
  avatar TEXT COMMENT 'Link anh dai dien',
  status ENUM('active', 'banned') DEFAULT 'active' COMMENT 'Trang thai tai khoan',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Thoi gian tao',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Thoi gian cap nhat',
  INDEX idx_users_role_status (role, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS membership_plans (
  id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT 'ID goi hoi vien',
  name VARCHAR(255) COMMENT 'Ten goi',
  description TEXT COMMENT 'Mo ta chi tiet goi',
  image_url TEXT COMMENT 'Hinh anh goi hoi vien',
  price DECIMAL(10,2) COMMENT 'Gia tien',
  duration_days INT COMMENT 'So ngay su dung',
  status ENUM('active', 'inactive') DEFAULT 'active' COMMENT 'Trang thai goi',
  created_by BIGINT NULL COMMENT 'ID admin/staff tao goi',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Thoi gian tao',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Thoi gian cap nhat',
  CONSTRAINT fk_membership_plans_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_membership_plans_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_memberships (
  id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT 'ID ban ghi mua goi',
  user_id BIGINT COMMENT 'ID nguoi dung',
  plan_id BIGINT COMMENT 'ID goi hoi vien',
  start_date DATETIME COMMENT 'Ngay bat dau',
  end_date DATETIME COMMENT 'Ngay ket thuc',
  price DECIMAL(10,2) COMMENT 'Gia tai thoi diem mua',
  qr_code LONGTEXT COMMENT 'Du lieu QR code',
  status ENUM('active', 'expired', 'cancelled') DEFAULT 'active' COMMENT 'Trang thai goi',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Thoi gian mua',
  CONSTRAINT fk_user_memberships_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_user_memberships_plan FOREIGN KEY (plan_id) REFERENCES membership_plans(id) ON DELETE RESTRICT,
  INDEX idx_user_memberships_user_status (user_id, status),
  INDEX idx_user_memberships_end_date (end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS exercises (
  id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT 'ID bai tap',
  name VARCHAR(255) COMMENT 'Ten bai tap',
  description TEXT COMMENT 'Mo ta bai tap',
  muscle_group VARCHAR(100) COMMENT 'Nhom co',
  difficulty ENUM('easy', 'medium', 'hard') COMMENT 'Do kho',
  equipment VARCHAR(100) COMMENT 'Dung cu su dung',
  video_url TEXT COMMENT 'Link video huong dan',
  thumbnail TEXT COMMENT 'Anh minh hoa',
  created_by BIGINT NULL COMMENT 'ID admin/staff tao',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Thoi gian tao',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Thoi gian cap nhat',
  CONSTRAINT fk_exercises_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_exercises_muscle_difficulty (muscle_group, difficulty)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS checkins (
  id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT 'ID luot checkin',
  user_id BIGINT COMMENT 'ID nguoi dung',
  membership_id BIGINT COMMENT 'ID goi dang su dung',
  checkin_time DATETIME COMMENT 'Thoi gian vao phong gym',
  checkout_time DATETIME NULL COMMENT 'Thoi gian roi phong gym',
  checkin_by BIGINT COMMENT 'ID staff/admin check-in',
  checkout_by BIGINT NULL COMMENT 'ID staff/admin check-out',
  status ENUM('checked_in', 'checked_out') DEFAULT 'checked_in' COMMENT 'Trang thai hien tai',
  note TEXT COMMENT 'Ghi chu',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Thoi gian tao ban ghi',
  CONSTRAINT fk_checkins_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_checkins_membership FOREIGN KEY (membership_id) REFERENCES user_memberships(id) ON DELETE RESTRICT,
  CONSTRAINT fk_checkins_checkin_by FOREIGN KEY (checkin_by) REFERENCES users(id) ON DELETE RESTRICT,
  CONSTRAINT fk_checkins_checkout_by FOREIGN KEY (checkout_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_checkins_user_status (user_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS payment_transactions (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  plan_id BIGINT NOT NULL,
  membership_id BIGINT NULL,
  order_ref VARCHAR(100) NOT NULL UNIQUE,
  amount DECIMAL(10,2) NOT NULL,
  status ENUM('pending', 'success', 'failed') DEFAULT 'pending',
  raw_response LONGTEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_payment_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_payment_plan FOREIGN KEY (plan_id) REFERENCES membership_plans(id) ON DELETE RESTRICT,
  CONSTRAINT fk_payment_membership FOREIGN KEY (membership_id) REFERENCES user_memberships(id) ON DELETE SET NULL,
  INDEX idx_payment_status_created (status, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
