-- ============================================================================
-- PART 11: LIVE DEMONSTRATION FOR HR
-- ============================================================================
SELECT '============================================' AS '';
SELECT 'PART 11: LIVE DEMONSTRATION' AS '';
SELECT '============================================' AS '';

-- Insert HR test user
SELECT 'Inserting HR Test User via stored procedure...' AS '';
CALL addUser('hr.review@company.com', 'HrTestPassword789', 'admin', TRUE);

-- Show the result
SELECT 'HR Test User successfully added:' AS '';
SELECT 
    userId AS 'User ID',
    email AS 'Email',
    type AS 'Type',
    CASE 
        WHEN active = 1 THEN '✅ Active'
        ELSE '❌ Inactive'
    END AS 'Status',
    DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') AS 'Created At'
FROM users 
WHERE email = 'hr.review@company.com';
