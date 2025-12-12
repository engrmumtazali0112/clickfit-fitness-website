-- ============================================================================
-- PART 5: DEMONSTRATE FULL WORKFLOW
-- ============================================================================
SELECT '============================================' AS '';
SELECT 'PART 5: FULL WORKFLOW DEMONSTRATION' AS '';
SELECT '============================================' AS '';

-- Step 1: Show current users
SELECT 'Current users in database:' AS '';
SELECT 
    userId AS 'ID',
    email AS 'Email',
    type AS 'Type',
    active AS 'Active'
FROM users;

-- Step 2: Insert another user via stored procedure
SELECT '';
SELECT 'Inserting another user via stored procedure...' AS '';
CALL addUser('demo_user@clickfit.com', 'demoPassword456', 'admin', TRUE);

-- Step 3: Show updated user list
SELECT '';
SELECT 'Updated user list:' AS '';
SELECT 
    userId AS 'ID',
    email AS 'Email',
    type AS 'Type',
    active AS 'Active'
FROM users;