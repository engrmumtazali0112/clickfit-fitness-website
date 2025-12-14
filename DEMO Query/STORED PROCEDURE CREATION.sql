-- ============================================================================
-- PART 3: STORED PROCEDURE CREATION (MySQL Requirement)
-- ============================================================================
SELECT '============================================' AS '';
SELECT 'PART 3: STORED PROCEDURE CREATION' AS 'Task Requirement';
SELECT '============================================' AS '';
SELECT 'Task: "Create stored procedure `addUser` to insert new user"' AS '';

-- Show the addUser stored procedure exists
SELECT 'Checking if addUser stored procedure exists:' AS '';
SELECT 
    ROUTINE_NAME AS 'Procedure Name',
    ROUTINE_DEFINITION AS 'Procedure Definition'
FROM information_schema.ROUTINES
WHERE ROUTINE_SCHEMA = 'clickfit_db'
AND ROUTINE_NAME = 'addUser';

-- Show procedure code
SELECT '';
SELECT 'addUser Stored Procedure Code:' AS '';
SHOW CREATE PROCEDURE addUser;