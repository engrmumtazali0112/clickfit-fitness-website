-- Test Insert Script for ClickFit Database
-- Use the database
USE clickfit_db;

-- Test 1: Insert a new admin user
CALL addUser(
    'admin@clickfit.com',
    'admin123456',
    'admin',
    TRUE
);

-- Test 2: Insert a new regular user
CALL addUser(
    'user@clickfit.com',
    'user123456',
    'user',
    TRUE
);

-- Test 3: Insert a trainer user
CALL addUser(
    'trainer@clickfit.com',
    'trainer123456',
    'trainer',
    TRUE
);

-- Test 4: Insert an inactive user
CALL addUser(
    'inactive@clickfit.com',
    'inactive123',
    'user',
    FALSE
);

-- Test 5: Insert test user with real email format
CALL addUser(
    'test.user@gmail.com',
    'testpass123',
    'user',
    TRUE
);

-- Display all inserted users
SELECT 
    userId,
    email,
    type,
    active,
    created_at
FROM users
ORDER BY userId;

-- Test getUserByEmail procedure
CALL getUserByEmail('admin@clickfit.com');

-- Test getActiveUsersCount procedure
CALL getActiveUsersCount();

-- Test getAllUsers procedure
CALL getAllUsers();

-- Display summary
SELECT 
    COUNT(*) AS total_users,
    SUM(CASE WHEN active = TRUE THEN 1 ELSE 0 END) AS active_users,
    SUM(CASE WHEN active = FALSE THEN 1 ELSE 0 END) AS inactive_users
FROM users;

-- Display users by type
SELECT 
    type,
    COUNT(*) AS count
FROM users
GROUP BY type
ORDER BY count DESC;

-- Success message
SELECT 'All test inserts completed successfully!' AS status;