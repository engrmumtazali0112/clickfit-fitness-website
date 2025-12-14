-- ============================================================================
-- PART 2: USERS TABLE CREATION (MySQL Requirement)
-- ============================================================================
SELECT '============================================' AS '';
SELECT 'PART 2: USERS TABLE CREATION' AS 'Task Requirement';
SELECT '============================================' AS '';
SELECT 'Task: "Creation of users table with columns: userId, email, password, type, active"' AS '';

-- Show table exists and structure
DESCRIBE users;

-- Verify all required columns exist
SELECT 'Verifying required columns:' AS '';
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.COLUMNS 
                     WHERE TABLE_SCHEMA = 'clickfit_db' 
                     AND TABLE_NAME = 'users' 
                     AND COLUMN_NAME = 'userId') 
        THEN '✓ userId column exists'
        ELSE '✗ userId column missing'
    END AS 'Column Check' UNION ALL
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.COLUMNS 
                     WHERE TABLE_SCHEMA = 'clickfit_db' 
                     AND TABLE_NAME = 'users' 
                     AND COLUMN_NAME = 'email') 
        THEN '✓ email column exists'
        ELSE '✗ email column missing'
    END UNION ALL
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.COLUMNS 
                     WHERE TABLE_SCHEMA = 'clickfit_db' 
                     AND TABLE_NAME = 'users' 
                     AND COLUMN_NAME = 'password') 
        THEN '✓ password column exists'
        ELSE '✗ password column missing'
    END UNION ALL
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.COLUMNS 
                     WHERE TABLE_SCHEMA = 'clickfit_db' 
                     AND TABLE_NAME = 'users' 
                     AND COLUMN_NAME = 'type') 
        THEN '✓ type column exists'
        ELSE '✗ type column missing'
    END UNION ALL
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.COLUMNS 
                     WHERE TABLE_SCHEMA = 'clickfit_db' 
                     AND TABLE_NAME = 'users' 
                     AND COLUMN_NAME = 'active') 
        THEN '✓ active column exists'
        ELSE '✗ active column missing'
    END;
