-- ============================================================================
-- PART 8: DATABASE STATISTICS FOR HR
-- ============================================================================
SELECT '============================================' AS '';
SELECT 'PART 8: DATABASE STATISTICS' AS '';
SELECT '============================================' AS '';

SELECT 
    COUNT(*) AS 'Total Users in Database',
    COUNT(DISTINCT type) AS 'Different User Types',
    SUM(CASE WHEN active = 1 THEN 1 ELSE 0 END) AS 'Active Users',
    DATE_FORMAT(MIN(created_at), '%Y-%m-%d %H:%i') AS 'First User Created',
    DATE_FORMAT(MAX(created_at), '%Y-%m-%d %H:%i') AS 'Latest User Created'
FROM users;