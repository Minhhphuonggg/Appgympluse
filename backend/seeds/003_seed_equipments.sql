INSERT INTO equipments (id, name, brand, quantity, size, weight_kg, image_url, condition_status, created_by)
VALUES
  (1, 'May chay bo ProTrack', 'ProTrack', 4, '180x80x140 cm', 95.00, 'https://res.cloudinary.com/demo/image/upload/treadmill.jpg', 'good', 1),
  (2, 'Xe dap tap Spin X2', 'SpinTech', 6, '120x55x110 cm', 42.50, 'https://res.cloudinary.com/demo/image/upload/spinbike.jpg', 'maintenance', 1),
  (3, 'Gian ta da nang GX', 'GymX', 2, '220x160x210 cm', 180.00, 'https://res.cloudinary.com/demo/image/upload/multigym.jpg', 'broken', 1)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  brand = VALUES(brand),
  quantity = VALUES(quantity),
  size = VALUES(size),
  weight_kg = VALUES(weight_kg),
  image_url = VALUES(image_url),
  condition_status = VALUES(condition_status),
  created_by = VALUES(created_by);
