UPDATE membership_plans
SET image_url = CASE id
  WHEN 1 THEN 'https://res.cloudinary.com/demo/image/upload/membership_1month.jpg'
  WHEN 2 THEN 'https://res.cloudinary.com/demo/image/upload/membership_3month.jpg'
  WHEN 3 THEN 'https://res.cloudinary.com/demo/image/upload/membership_12month.jpg'
  ELSE image_url
END
WHERE id IN (1, 2, 3);
