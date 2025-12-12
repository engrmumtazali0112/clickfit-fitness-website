# ClickFit - Fitness Website Setup Guide

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MySQL Server (v5.7 or higher)
- Web browser (Chrome, Firefox, Edge)

## 📁 Project Structure

```
clickfit/
├── index.html
├── css/
│   ├── style.css
│   └── animations.css
├── js/
│   ├── main.js
│   ├── ajax-handler.js (FIXED)
│   └── upload-handler.js (FIXED)
├── server/
│   ├── server.js
│   └── package.json
├── upload_images/ (created automatically)
└── database/
    ├── schema.sql
    ├── stored_procedures.sql
    └── test_insert.sql
```

## 🔧 Installation Steps

### Step 1: Install Node.js Dependencies

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install
```

### Step 2: Setup MySQL Database

1. Open MySQL Workbench or MySQL command line
2. Run the following scripts in order:

```bash
# 1. Create database and tables
mysql -u root -p < database/schema.sql

# 2. Create stored procedures
mysql -u root -p < database/stored_procedures.sql

# 3. Insert test data (optional)
mysql -u root -p < database/test_insert.sql
```

Or manually run each SQL file:

```sql
-- schema.sql
CREATE DATABASE IF NOT EXISTS clickfit_db;
USE clickfit_db;

CREATE TABLE users (
    userId INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    type VARCHAR(50) DEFAULT 'user',
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_type (type),
    INDEX idx_active (active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Step 3: Start the Server

```bash
# From the server directory
npm start

# Or for development with auto-reload
npm run dev
```

You should see:
```
=================================
🚀 ClickFit Server Started!
=================================
📡 Server running on: http://localhost:3000
📁 Upload directory: /path/to/upload_images
📸 Upload endpoint: http://localhost:3000/upload
=================================
```

### Step 4: Open the Website

1. Open your browser
2. Navigate to: `http://localhost:3000`
3. The website should load with all features working

## 🐛 Troubleshooting

### Image Upload Not Working

**Problem:** "Cannot connect to server" error when uploading

**Solution:**
1. Make sure the server is running (`npm start` in server directory)
2. Check that port 3000 is not in use by another application
3. Verify the upload_images folder exists and has write permissions

```bash
# Create upload folder if missing
mkdir upload_images
chmod 755 upload_images
```

### Numbers API Not Loading

**Problem:** "Unable to load fun fact" message

**Solution:**
1. Check your internet connection
2. The API might be temporarily down - the page will show an error with a retry button
3. Check browser console for CORS errors
4. The fixed version tries HTTPS first, then falls back to HTTP

### MySQL Connection Issues

**Problem:** Cannot connect to database

**Solution:**
1. Verify MySQL server is running
2. Check MySQL credentials
3. Ensure database exists: `SHOW DATABASES;`
4. Check user permissions: `GRANT ALL PRIVILEGES ON clickfit_db.* TO 'your_user'@'localhost';`

### Port Already in Use

**Problem:** "Port 3000 is already in use"

**Solution:**
```bash
# Find process using port 3000
# On Windows:
netstat -ano | findstr :3000

# On Mac/Linux:
lsof -i :3000

# Kill the process or change port in server.js
# Change: const PORT = process.env.PORT || 3000;
# To: const PORT = process.env.PORT || 3001;
```

## ✨ Features Checklist

- ✅ Responsive design with Bootstrap
- ✅ CSS animations (fade-in, slide, zoom, pulse)
- ✅ AJAX call to Numbers API on page load
- ✅ Drag & drop image upload
- ✅ Click to browse and upload images
- ✅ Image preview with delete functionality
- ✅ Node.js Express backend
- ✅ MySQL database with users table
- ✅ Stored procedure `addUser`
- ✅ File upload to local folder (not cloud)
- ✅ Smooth scrolling navigation
- ✅ Counter animations
- ✅ Hover effects on cards

## 🔑 Key Files to Replace

Replace these files with the fixed versions:

1. **js/upload-handler.js** - Fixed drag & drop and error handling
2. **js/ajax-handler.js** - Fixed HTTPS/HTTP fallback for Numbers API

## 📝 Testing the Upload Feature

1. **Test Drag & Drop:**
   - Drag an image file onto the blue dashed box
   - Image should upload and appear below

2. **Test Click Upload:**
   - Click "Browse Files" button
   - Select one or more images
   - Images should upload and display

3. **Test Delete:**
   - Click on an uploaded image
   - Click the red "Delete" button
   - Confirm deletion
   - Image should disappear

## 🗃️ Database Testing

```sql
-- Test the stored procedure
CALL addUser('test@example.com', 'password123', 'user', TRUE);

-- View all users
SELECT * FROM users;

-- Test other procedures
CALL getUserByEmail('test@example.com');
CALL getActiveUsersCount();
CALL getAllUsers();
```

## 🌐 API Endpoints

### Upload Single Image
```
POST http://localhost:3000/upload
Content-Type: multipart/form-data
Body: image=[file]
```

### Upload Multiple Images
```
POST http://localhost:3000/upload-multiple
Content-Type: multipart/form-data
Body: images=[files]
```

### Delete Image
```
DELETE http://localhost:3000/delete/:filename
```

### Get All Images
```
GET http://localhost:3000/images
```

## 📊 Success Indicators

When everything is working correctly, you should see:

1. ✅ Server starts without errors
2. ✅ Website loads at localhost:3000
3. ✅ Fun fact appears in "Did You Know?" section
4. ✅ Images can be dragged and dropped
5. ✅ Uploaded images appear with preview
6. ✅ Images save to upload_images folder
7. ✅ All animations work smoothly
8. ✅ MySQL database has test users

## 🛠️ Common Commands

```bash
# Start server
npm start

# Start with auto-reload (development)
npm run dev

# Check if server is running
curl http://localhost:3000

# View server logs
# (logs appear in terminal where server is running)

# Stop server
# Press Ctrl+C in the terminal
```

## 📞 Support

If you encounter issues:
1. Check the browser console (F12) for JavaScript errors
2. Check the server terminal for backend errors
3. Verify all files are in the correct directories
4. Ensure all dependencies are installed
5. Check that MySQL server is running

## 🎯 What Works vs What Doesn't

### ✅ Working Features:
- Main page with all sections
- Image upload functionality
- AJAX API call to Numbers API
- All animations
- Responsive design
- Database operations

### ⚠️ Expected Behavior:
- Other navigation links (About, Services, Contact) may show 404
- This is normal as per task requirements ("only main page will work")

## 🔒 Security Notes

**This is a demo project. In production:**
- Hash passwords before storing
- Add user authentication
- Validate all file uploads
- Add rate limiting
- Use environment variables for sensitive data
- Add input sanitization
- Implement HTTPS

---

**Made for ClickFit Technical Assessment** # ClickFit - Fitness Website Setup Guide

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MySQL Server (v5.7 or higher)
- Web browser (Chrome, Firefox, Edge)

## 📁 Project Structure

```
clickfit/
├── index.html
├── css/
│   ├── style.css
│   └── animations.css
├── js/
│   ├── main.js
│   ├── ajax-handler.js (FIXED)
│   └── upload-handler.js (FIXED)
├── server/
│   ├── server.js
│   └── package.json
├── upload_images/ (created automatically)
└── database/
    ├── schema.sql
    ├── stored_procedures.sql
    └── test_insert.sql
```

## 🔧 Installation Steps

### Step 1: Install Node.js Dependencies

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install
```

### Step 2: Setup MySQL Database

1. Open MySQL Workbench or MySQL command line
2. Run the following scripts in order:

```bash
# 1. Create database and tables
mysql -u root -p < database/schema.sql

# 2. Create stored procedures
mysql -u root -p < database/stored_procedures.sql

# 3. Insert test data (optional)
mysql -u root -p < database/test_insert.sql
```

Or manually run each SQL file:

```sql
-- schema.sql
CREATE DATABASE IF NOT EXISTS clickfit_db;
USE clickfit_db;

CREATE TABLE users (
    userId INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    type VARCHAR(50) DEFAULT 'user',
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_type (type),
    INDEX idx_active (active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Step 3: Start the Server

```bash
# From the server directory
npm start

# Or for development with auto-reload
npm run dev
```

You should see:
```
=================================
🚀 ClickFit Server Started!
=================================
📡 Server running on: http://localhost:3000
📁 Upload directory: /path/to/upload_images
📸 Upload endpoint: http://localhost:3000/upload
=================================
```

### Step 4: Open the Website

1. Open your browser
2. Navigate to: `http://localhost:3000`
3. The website should load with all features working

## 🐛 Troubleshooting

### Image Upload Not Working

**Problem:** "Cannot connect to server" error when uploading

**Solution:**
1. Make sure the server is running (`npm start` in server directory)
2. Check that port 3000 is not in use by another application
3. Verify the upload_images folder exists and has write permissions

```bash
# Create upload folder if missing
mkdir upload_images
chmod 755 upload_images
```

### Numbers API Not Loading

**Problem:** "Unable to load fun fact" message

**Solution:**
1. Check your internet connection
2. The API might be temporarily down - the page will show an error with a retry button
3. Check browser console for CORS errors
4. The fixed version tries HTTPS first, then falls back to HTTP

### MySQL Connection Issues

**Problem:** Cannot connect to database

**Solution:**
1. Verify MySQL server is running
2. Check MySQL credentials
3. Ensure database exists: `SHOW DATABASES;`
4. Check user permissions: `GRANT ALL PRIVILEGES ON clickfit_db.* TO 'your_user'@'localhost';`

### Port Already in Use

**Problem:** "Port 3000 is already in use"

**Solution:**
```bash
# Find process using port 3000
# On Windows:
netstat -ano | findstr :3000

# On Mac/Linux:
lsof -i :3000

# Kill the process or change port in server.js
# Change: const PORT = process.env.PORT || 3000;
# To: const PORT = process.env.PORT || 3001;
```

## ✨ Features Checklist

- ✅ Responsive design with Bootstrap
- ✅ CSS animations (fade-in, slide, zoom, pulse)
- ✅ AJAX call to Numbers API on page load
- ✅ Drag & drop image upload
- ✅ Click to browse and upload images
- ✅ Image preview with delete functionality
- ✅ Node.js Express backend
- ✅ MySQL database with users table
- ✅ Stored procedure `addUser`
- ✅ File upload to local folder (not cloud)
- ✅ Smooth scrolling navigation
- ✅ Counter animations
- ✅ Hover effects on cards

## 🔑 Key Files to Replace

Replace these files with the fixed versions:

1. **js/upload-handler.js** - Fixed drag & drop and error handling
2. **js/ajax-handler.js** - Fixed HTTPS/HTTP fallback for Numbers API

## 📝 Testing the Upload Feature

1. **Test Drag & Drop:**
   - Drag an image file onto the blue dashed box
   - Image should upload and appear below

2. **Test Click Upload:**
   - Click "Browse Files" button
   - Select one or more images
   - Images should upload and display

3. **Test Delete:**
   - Click on an uploaded image
   - Click the red "Delete" button
   - Confirm deletion
   - Image should disappear

## 🗃️ Database Testing

```sql
-- Test the stored procedure
CALL addUser('test@example.com', 'password123', 'user', TRUE);

-- View all users
SELECT * FROM users;

-- Test other procedures
CALL getUserByEmail('test@example.com');
CALL getActiveUsersCount();
CALL getAllUsers();
```

## 🌐 API Endpoints

### Upload Single Image
```
POST http://localhost:3000/upload
Content-Type: multipart/form-data
Body: image=[file]
```

### Upload Multiple Images
```
POST http://localhost:3000/upload-multiple
Content-Type: multipart/form-data
Body: images=[files]
```

### Delete Image
```
DELETE http://localhost:3000/delete/:filename
```

### Get All Images
```
GET http://localhost:3000/images
```

## 📊 Success Indicators

When everything is working correctly, you should see:

1. ✅ Server starts without errors
2. ✅ Website loads at localhost:3000
3. ✅ Fun fact appears in "Did You Know?" section
4. ✅ Images can be dragged and dropped
5. ✅ Uploaded images appear with preview
6. ✅ Images save to upload_images folder
7. ✅ All animations work smoothly
8. ✅ MySQL database has test users

## 🛠️ Common Commands

```bash
# Start server
npm start

# Start with auto-reload (development)
npm run dev

# Check if server is running
curl http://localhost:3000

# View server logs
# (logs appear in terminal where server is running)

# Stop server
# Press Ctrl+C in the terminal
```

## 📞 Support

If you encounter issues:
1. Check the browser console (F12) for JavaScript errors
2. Check the server terminal for backend errors
3. Verify all files are in the correct directories
4. Ensure all dependencies are installed
5. Check that MySQL server is running

## 🎯 What Works vs What Doesn't

### ✅ Working Features:
- Main page with all sections
- Image upload functionality
- AJAX API call to Numbers API
- All animations
- Responsive design
- Database operations

### ⚠️ Expected Behavior:
- Other navigation links (About, Services, Contact) may show 404
- This is normal as per task requirements ("only main page will work")

## 🔒 Security Notes

**This is a demo project. In production:**
- Hash passwords before storing
- Add user authentication
- Validate all file uploads
- Add rate limiting
- Use environment variables for sensitive data
- Add input sanitization
- Implement HTTPS

---

**Made for ClickFit Technical Assessment** 💪