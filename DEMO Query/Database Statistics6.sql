
-- ============================================================================
-- STEP 6: DATABASE STATISTICS
-- ============================================================================
SELECT '============================================' AS '';
SELECT 'STEP 6: Database Statistics' AS 'Section';
SELECT '============================================' AS '';

-- Total users count
SELECT 
    COUNT(*) AS 'Total Users',
    SUM(CASE WHEN active = 1 THEN 1 ELSE 0 END) AS 'Active Users',
    SUM(CASE WHEN active = 0 THEN 1 ELSE 0 END) AS 'Inactive Users',
    COUNT(DISTINCT type) AS 'User Types',
    ROUND((SUM(CASE WHEN active = 1 THEN 1 ELSE 0 END) / COUNT(*)) * 100, 2) AS 'Active %'
FROM users;

SELECT '';
SELECT 'Users by Type:' AS '';

SELECT 
    type AS 'User Type',
    COUNT(*) AS 'Count',
    GROUP_CONCAT(email SEPARATOR ', ') AS 'Emails'
FROM users
GROUP BY type
ORDER BY COUNT(*) DESC;