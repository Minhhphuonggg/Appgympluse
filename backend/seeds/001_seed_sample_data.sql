INSERT INTO users (id, name, email, password, role, phone, avatar, status)
VALUES
  (1, 'Admin Gym', 'admin@gym.local', '$2b$10$/8OY4eXQs2c91CAy4BXC5O6o.wtDyS18/6035i1SQFHdrJobhg/iG', 'admin', '0900000001', NULL, 'active'),
  (2, 'Staff Gym', 'staff@gym.local', '$2b$10$/8OY4eXQs2c91CAy4BXC5O6o.wtDyS18/6035i1SQFHdrJobhg/iG', 'staff', '0900000002', NULL, 'active'),
  (3, 'User Gym', 'user@gym.local', '$2b$10$/8OY4eXQs2c91CAy4BXC5O6o.wtDyS18/6035i1SQFHdrJobhg/iG', 'user', '0900000003', NULL, 'active')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  password = VALUES(password),
  role = VALUES(role),
  phone = VALUES(phone),
  status = VALUES(status);

INSERT INTO membership_plans (id, name, description, image_url, price, duration_days, status, created_by)
VALUES
  (1, 'Goi 1 thang', 'Tap tu do khong gioi han trong 30 ngay', 'https://res.cloudinary.com/demo/image/upload/membership_1month.jpg', 500000.00, 30, 'active', 1),
  (2, 'Goi 3 thang', 'Tap tu do + huong dan co ban trong 90 ngay', 'https://res.cloudinary.com/demo/image/upload/membership_3month.jpg', 1350000.00, 90, 'active', 2),
  (3, 'Goi 12 thang', 'Goi tiet kiem ca nam', 'https://res.cloudinary.com/demo/image/upload/membership_12month.jpg', 4500000.00, 365, 'inactive', 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  image_url = VALUES(image_url),
  price = VALUES(price),
  duration_days = VALUES(duration_days),
  status = VALUES(status),
  created_by = VALUES(created_by);

INSERT INTO exercises (id, name, description, muscle_group, difficulty, equipment, video_url, thumbnail, created_by)
VALUES
  (1, 'Push Up', 'Bai tap nguc co ban cho nguoi moi', 'chest', 'easy', 'none', 'https://www.youtube.com/watch?v=IODxDxX7oi4', 'https://res.cloudinary.com/demo/image/upload/sample.jpg', 2),
  (2, 'Barbell Squat', 'Bai tap chan va mong voi ta don', 'legs', 'medium', 'barbell', 'https://www.youtube.com/watch?v=ultWZbUMPL8', 'https://res.cloudinary.com/demo/image/upload/sample.jpg', 1),
  (3, 'Deadlift', 'Bai tap tong hop tang suc manh', 'back', 'hard', 'barbell', 'https://www.youtube.com/watch?v=op9kVnSso6Q', 'https://res.cloudinary.com/demo/image/upload/sample.jpg', 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  muscle_group = VALUES(muscle_group),
  difficulty = VALUES(difficulty),
  equipment = VALUES(equipment),
  video_url = VALUES(video_url),
  thumbnail = VALUES(thumbnail),
  created_by = VALUES(created_by);

INSERT INTO user_memberships (id, user_id, plan_id, start_date, end_date, price, qr_code, status)
VALUES
  (1, 3, 1, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 500000.00, 'sample-qr-data', 'active')
ON DUPLICATE KEY UPDATE
  user_id = VALUES(user_id),
  plan_id = VALUES(plan_id),
  start_date = VALUES(start_date),
  end_date = VALUES(end_date),
  price = VALUES(price),
  qr_code = VALUES(qr_code),
  status = VALUES(status);

INSERT INTO checkins (id, user_id, membership_id, checkin_time, checkout_time, checkin_by, checkout_by, status, note)
VALUES
  (1, 3, 1, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY) + INTERVAL 90 MINUTE, 2, 2, 'checked_out', 'Seed data checkin')
ON DUPLICATE KEY UPDATE
  user_id = VALUES(user_id),
  membership_id = VALUES(membership_id),
  checkin_time = VALUES(checkin_time),
  checkout_time = VALUES(checkout_time),
  checkin_by = VALUES(checkin_by),
  checkout_by = VALUES(checkout_by),
  status = VALUES(status),
  note = VALUES(note);
