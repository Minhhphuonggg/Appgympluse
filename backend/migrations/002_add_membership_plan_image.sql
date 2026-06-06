SET @db_name = DATABASE();

SET @column_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = @db_name
    AND TABLE_NAME = 'membership_plans'
    AND COLUMN_NAME = 'image_url'
);

SET @sql = IF(
  @column_exists = 0,
  "ALTER TABLE membership_plans ADD COLUMN image_url TEXT COMMENT 'Hinh anh goi hoi vien' AFTER description",
  "SELECT 1"
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
