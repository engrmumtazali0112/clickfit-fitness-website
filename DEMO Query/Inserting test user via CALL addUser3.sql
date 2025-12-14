-- ============================================================================
-- PART 4: STORED PROCEDURE TEST (MySQL Requirement)
-- ============================================================================
SELECT '============================================' AS '';
SELECT 'PART 4: STORED PROCEDURE TEST' AS 'Task Requirement';
SELECT '============================================' AS '';
SELECT 'Task: "Write call to stored procedure `addUser` that will insert new user"' AS '';

-- Clear table for clean demonstration (optional)
-- DELETE FROM users WHERE email LIKE '%@clickfit.com';

-- Insert test user via stored procedure
SELECT 'Inserting test user via CALL addUser()...' AS '';
CALL addUser('test_user@clickfit.com', 'securePass123', 'user', TRUE);

-- Verify the user was inserted
SELECT '';
SELECT 'Verifying user insertion:' AS '';
SELECT 
    userId,
    email,
    type,
    CASE 
        WHEN active = 1 THEN 'Active'
        ELSE 'Inactive'
    END AS status,
    created_at
FROM users 
WHERE email = 'test_user@clickfit.com';