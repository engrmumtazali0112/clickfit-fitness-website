-- =====================================================
-- CLICKFIT DATABASE - COMPLETE SETUP SCRIPT
-- =====================================================
-- This script creates:
-- 1. Users table with required columns
-- 2. Stored procedure addUser
-- 3. Test data insertion via stored procedure
-- =====================================================

-- Use the database (adjust if needed)
USE clickfitness;

-- =====================================================
-- PART 1: CREATE USERS TABLE
-- =====================================================

DROP TABLE IF EXISTS users;

CREATE TABLE users (
    userId INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    type ENUM('user', 'admin', 'trainer') DEFAULT 'user',
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_type (type),
    INDEX idx_active (active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SELECT '✅ Users table created successfully!' AS status;

-- =====================================================
-- PART 2: CREATE STORED PROCEDURE addUser
-- =====================================================

DROP PROCEDURE IF EXISTS addUser;

DELIMITER //

CREATE PROCEDURE addUser(
    IN p_email VARCHAR(255),
    IN p_password VARCHAR(255),
    IN p_type VARCHAR(50),
    IN p_active BOOLEAN
)
BEGIN
    -- Declare variables for error handling
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        -- Rollback on error
        ROLLBACK;
        SELECT 'Error: Failed to insert user' AS status, 0 AS userId;
    END;
    
    -- Start transaction
    START TRANSACTION;
    
    -- Insert new user
    INSERT INTO users (email, password, type, active)
    VALUES (p_email, p_password, p_type, p_active);
    
    -- Commit transaction
    COMMIT;
    
    -- Return success with new user ID
    SELECT 
        LAST_INSERT_ID() AS userId,
        'User added successfully!' AS status;
        
END //

DELIMITER ;

SELECT '✅ Stored procedure addUser created successfully!' AS status;

-- =====================================================
-- PART 3: TEST STORED PROCEDURE - INSERT USERS
-- =====================================================

-- Test 1: Insert Admin User
CALL addUser('admin@clickfit.com', 'admin123456', 'admin', TRUE);

-- Test 2: Insert Regular User
CALL addUser('john.doe@example.com', 'john123456', 'user', TRUE);

-- Test 3: Insert Trainer User
CALL addUser('trainer@clickfit.com', 'trainer123456', 'trainer', TRUE);

-- Test 4: Insert Inactive User
CALL addUser('inactive@example.com', 'inactive123', 'user', FALSE);

-- Test 5: Insert Another Active User
CALL addUser('jane.smith@example.com', 'jane123456', 'user', TRUE);

SELECT '✅ Test users inserted via stored procedure!' AS status;

-- =====================================================
-- PART 4: VERIFICATION QUERIES
-- =====================================================

-- Show all users
SELECT '📊 All Users in Database:' AS info;
SELECT 
    userId,
    email,
    type,
    CASE WHEN active = 1 THEN '✅ Active' ELSE '❌ Inactive' END AS status,
    created_at
FROM users
ORDER BY userId;

-- Show user count by type
SELECT '📊 Users by Type:' AS info;
SELECT 
    type AS 'User Type',
    COUNT(*) AS 'Count'
FROM users
GROUP BY type;

-- Show active vs inactive
SELECT '📊 Active vs Inactive Users:' AS info;
SELECT 
    CASE WHEN active = 1 THEN 'Active' ELSE 'Inactive' END AS 'Status',
    COUNT(*) AS 'Count'
FROM users
GROUP BY active;

-- =====================================================
-- PART 5: ADDITIONAL STORED PROCEDURES (BONUS)
-- =====================================================

-- Get user by email
DROP PROCEDURE IF EXISTS getUserByEmail;

DELIMITER //

CREATE PROCEDURE getUserByEmail(
    IN p_email VARCHAR(255)
)
BEGIN
    SELECT 
        userId,
        email,
        type,
        active,
        created_at
    FROM users
    WHERE email = p_email;
END //

DELIMITER ;

-- Get all active users
DROP PROCEDURE IF EXISTS getActiveUsers;

DELIMITER //

CREATE PROCEDURE getActiveUsers()
BEGIN
    SELECT 
        userId,
        email,
        type,
        created_at
    FROM users
    WHERE active = TRUE
    ORDER BY created_at DESC;
END //

DELIMITER ;

-- Update user
DROP PROCEDURE IF EXISTS updateUser;

DELIMITER //

CREATE PROCEDURE updateUser(
    IN p_userId INT,
    IN p_email VARCHAR(255),
    IN p_type VARCHAR(50),
    IN p_active BOOLEAN
)
BEGIN
    UPDATE users
    SET 
        email = p_email,
        type = p_type,
        active = p_active
    WHERE userId = p_userId;
    
    SELECT 'User updated successfully!' AS status;
END //

DELIMITER ;

SELECT '✅ All stored procedures created successfully!' AS status;

-- =====================================================
-- PART 6: EXAMPLE USAGE
-- =====================================================

-- Example 1: Add a new user
-- CALL addUser('newuser@example.com', 'password123', 'user', TRUE);

-- Example 2: Get user by email
-- CALL getUserByEmail('admin@clickfit.com');

-- Example 3: Get all active users
-- CALL getActiveUsers();

-- Example 4: Update a user
-- CALL updateUser(1, 'admin@clickfit.com', 'admin', TRUE);

-- =====================================================
-- SETUP COMPLETE! ✅
-- =====================================================

SELECT '🎉 DATABASE SETUP COMPLETE!' AS status;
SELECT 'Total Users Created:' AS info, COUNT(*) AS count FROM users;