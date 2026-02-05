-- DailyWorkLog MySQL init script
-- Replace database name if needed before running.

CREATE DATABASE IF NOT EXISTS `dailyworklog`
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `dailyworklog`;

CREATE TABLE IF NOT EXISTS dwl_users (
  id CHAR(36) NOT NULL,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_dwl_users_email (email)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS dwl_worklog_template_columns (
  user_id CHAR(36) NOT NULL,
  id VARCHAR(64) NOT NULL,
  title VARCHAR(255) NOT NULL,
  position INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, id),
  KEY idx_dwl_template_columns_user (user_id),
  CONSTRAINT fk_dwl_template_columns_user
    FOREIGN KEY (user_id) REFERENCES dwl_users(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS dwl_worklog_template_items (
  user_id CHAR(36) NOT NULL,
  id VARCHAR(64) NOT NULL,
  column_id VARCHAR(64) NOT NULL,
  title VARCHAR(255) NOT NULL,
  meta TEXT NULL,
  assignee VARCHAR(255) NOT NULL,
  time VARCHAR(16) NOT NULL,
  tag VARCHAR(64) NULL,
  tag_type VARCHAR(16) NULL,
  due_offset_days INT NOT NULL DEFAULT 0,
  important TINYINT(1) NOT NULL DEFAULT 0,
  position INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, id),
  KEY idx_dwl_template_items_user (user_id),
  KEY idx_dwl_template_items_column (user_id, column_id),
  CONSTRAINT fk_dwl_template_items_column
    FOREIGN KEY (user_id, column_id)
    REFERENCES dwl_worklog_template_columns(user_id, id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS dwl_worklog_items (
  id CHAR(36) NOT NULL,
  user_id CHAR(36) NOT NULL,
  column_id VARCHAR(64) NOT NULL,
  title VARCHAR(255) NOT NULL,
  meta TEXT NULL,
  assignee VARCHAR(255) NOT NULL,
  time VARCHAR(16) NOT NULL,
  tag VARCHAR(64) NULL,
  tag_type VARCHAR(16) NULL,
  due_date DATETIME NULL,
  important TINYINT(1) NOT NULL DEFAULT 0,
  position INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_dwl_items_user (user_id),
  KEY idx_dwl_items_due (due_date),
  CONSTRAINT fk_dwl_items_user
    FOREIGN KEY (user_id) REFERENCES dwl_users(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_dwl_items_column
    FOREIGN KEY (user_id, column_id)
    REFERENCES dwl_worklog_template_columns(user_id, id)
    ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS dwl_revoked_tokens (
  token VARCHAR(1024) NOT NULL,
  revoked_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (token)
) ENGINE=InnoDB;

-- Optional demo seed (replace password hash with bcrypt hash if needed)
-- INSERT INTO dwl_users (id, email, name, password_hash)
-- VALUES ("00000000-0000-0000-0000-000000000001", "demo@dailyworklog.vn", "Demo User", "__BCRYPT_HASH__");
