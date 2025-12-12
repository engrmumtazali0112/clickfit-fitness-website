-- ClickFit Stored Procedures
-- Use the database
USE clickfit_db;

-- Drop procedure if exists (for clean setup)
DROP PROCEDURE IF EXISTS addUser;

-- Change delimiter to allow semicolons in procedure body
DELIMITER //

-- Create stored procedure to add new user
CREATE PROCEDURE addUser(
    IN p_email VARCHAR(255),
    IN p_password VARCHAR(255),
    IN p_type VARCHAR(50),
    IN p_active BOOLEAN
)
BEGIN
    -- Declare variables for error handling
    DECLARE exit handler FOR SQLEXCEPTION
    BEGIN
        -- Rollback the transaction on error
        ROLLBACK;
        -- Return error message
        SELECT 'Error: Failed to insert user' AS status;
    END;
    
    -- Start transaction
    START TRANSACTION;
    
    -- Insert new user
    INSERT INTO users (email, password, type, active)
    VALUES (p_email, p_password, p_type, p_active);
    
    -- Commit transaction
    COMMIT;
    
    -- Return success message with the new user ID
    SELECT 
        LAST_INSERT_ID() AS userId,
        'User added successfully!' AS status;
        
END //

-- Reset delimiter
DELIMITER ;

-- Display success message
SELECT 'Stored procedure addUser created successfully!' AS status;

-- Optional: Create additional stored procedures

-- Procedure to get user by email
DELIMITER //

DROP PROCEDURE IF EXISTS getUserByEmail //

CREATE PROCEDURE getUserByEmail(
    IN p_email VARCHAR(255)
)
BEGIN
    SELECT 
        userId,
        email,
        type,
        active,
        created_at,
        updated_at
    FROM users
    WHERE email = p_email;
END //

DELIMITER ;

-- Procedure to update user
DELIMITER //

DROP PROCEDURE IF EXISTS updateUser //

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
        active = p_active,
        updated_at = CURRENT_TIMESTAMP
    WHERE userId = p_userId;
    
    SELECT 'User updated successfully!' AS status;
END //

DELIMITER ;

-- Procedure to delete user
DELIMITER //

DROP PROCEDURE IF EXISTS deleteUser //

CREATE PROCEDURE deleteUser(
    IN p_userId INT
)
BEGIN
    DELETE FROM users
    WHERE userId = p_userId;
    
    SELECT 'User deleted successfully!' AS status;
END //

DELIMITER ;

-- Procedure to get all users
DELIMITER //

DROP PROCEDURE IF EXISTS getAllUsers //

CREATE PROCEDURE getAllUsers()
BEGIN
    SELECT 
        userId,
        email,
        type,
        active,
        created_at,
        updated_at
    FROM users
    ORDER BY created_at DESC;
END //

DELIMITER ;

-- Procedure to get active users count
DELIMITER //

DROP PROCEDURE IF EXISTS getActiveUsersCount //

CREATE PROCEDURE getActiveUsersCount()
BEGIN
    SELECT COUNT(*) AS active_users_count
    FROM users
    WHERE active = TRUE;
END //

DELIMITER ;

-- Display all created procedures
SELECT 'All stored procedures created successfully!' AS status;

-- Show all procedures in the database
SHOW PROCEDURE STATUS WHERE Db = 'clickfit_db';