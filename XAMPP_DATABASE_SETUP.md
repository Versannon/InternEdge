# 🛠️ XAMPP MySQL Database Setup Guide for InternEdge

This guide walks you through setting up the **XAMPP MySQL** database for the **InternEdge** Job Portal.

---

## 📋 Prerequisites
1. **XAMPP Control Panel** installed on your Windows system. (If not installed, download from [apachefriends.org](https://www.apachefriends.org/index.html)).
2. Node.js (v18 or higher) installed.

---

## 🚀 Step-by-Step Setup Instructions

### Step 1: Start XAMPP Services
1. Open **XAMPP Control Panel** from your Start Menu or desktop shortcut.
2. Locate **Apache** and **MySQL** in the module list.
3. Click the **Start** button next to both **Apache** and **MySQL**.
4. Ensure both modules turn **Green** and display their active ports (Default: Apache `80, 443`, MySQL `3306`).

---

### Step 2: Open phpMyAdmin
1. Open your web browser (Chrome, Edge, Firefox, etc.).
2. Navigate to `http://localhost/phpmyadmin/` or click the **Admin** button next to **MySQL** in XAMPP Control Panel.

---

### Step 3: Create Database `internedge_db`
1. On the left sidebar of phpMyAdmin, click **New** (or click the **Databases** tab at the top).
2. Enter `internedge_db` as the **Database name**.
3. Select collation: `utf8mb4_unicode_ci` (or default `utf8mb4_general_ci`).
4. Click **Create**.

---

### Step 4: Import Database Schema & Seed Data
1. Select `internedge_db` from the left sidebar list in phpMyAdmin.
2. Click on the **SQL** tab in the top navigation menu.
3. Open the file `schema.sql` located inside your project root folder (`c:\SOHAM\App_Development\Helper\schema.sql`).
4. Copy the complete SQL code from `schema.sql` and paste it into the SQL text area in phpMyAdmin.
5. Click **Go** (bottom right) to execute the queries.
6. Verify that tables (`students`, `companies`, `otp_verifications`, `jobs`, `applications`) are created successfully.

---

### Step 5: Configure Application Environment Variables
Verify your `.env.local` file in the project root matches your XAMPP MySQL credentials:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=internedge_db
DB_PORT=3306
```

> 💡 **Note for XAMPP Default Installation**: By default, XAMPP sets `root` as the username with **no password** (blank password). If you have set a custom password for root in phpMyAdmin, update `DB_PASSWORD` accordingly.

---

## 🧪 Database Verification & API Fallback
- The app features a dual-mode database handler in `lib/db.js`.
- If XAMPP MySQL is active, all user registrations, job postings, and applications save directly into your MySQL database!
- If XAMPP is offline or unreachable, the application automatically falls back to simulated in-memory storage so you can test the UI smoothly.

---

## 🌟 Database Schema Diagram Overview
```
+------------------+       +------------------------+
|     students     |       |       companies        |
+------------------+       +------------------------+
| id (PK)          |       | id (PK)                |
| fullname, email  |       | company_name, email    |
| mobile, password |       | contact, password      |
| dob, gender...   |       | industry_type...       |
+------------------+       +------------------------+
         ^                              ^
         |                              |
         |                              +--------+
         |                                       |
+--------+---------+       +---------------------+--+
|   applications   |       |          jobs          |
+------------------+       +------------------------+
| id (PK)          |       | id (PK)                |
| job_id (FK)      | <---+ | company_id (FK)        |
| student_id (FK)  |       | title, location...     |
| status, notes... |       | description...         |
+------------------+       +------------------------+
```
