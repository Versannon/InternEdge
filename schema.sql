-- InternEdge Advanced Enterprise MySQL Database Schema for XAMPP
-- Database Name: internedge_db

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS applications;
DROP TABLE IF EXISTS interviews;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS jobs;
DROP TABLE IF EXISTS companies;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS admins;
DROP TABLE IF EXISTS otp_verifications;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Admins Table
CREATE TABLE admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Students Table
CREATE TABLE students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fullname VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    mobile VARCHAR(50) NOT NULL,
    password VARCHAR(255) NOT NULL,
    dob DATE DEFAULT NULL,
    gender VARCHAR(50) NOT NULL,
    college VARCHAR(255) NOT NULL,
    course VARCHAR(100) NOT NULL,
    semester VARCHAR(50) NOT NULL,
    branch VARCHAR(100) NOT NULL,
    graduation_year INT NOT NULL,
    cgpa VARCHAR(50) NOT NULL,
    skills TEXT NOT NULL, -- JSON array
    experience VARCHAR(50) NOT NULL,
    portfolio VARCHAR(255) DEFAULT NULL,
    linkedin VARCHAR(255) DEFAULT NULL,
    github VARCHAR(255) DEFAULT NULL,
    resume VARCHAR(255) DEFAULT NULL,
    profile_pic VARCHAR(255) DEFAULT NULL,
    otp VARCHAR(10) DEFAULT NULL,
    verified TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Companies Table (Moderated Verification)
CREATE TABLE companies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    contact VARCHAR(50) NOT NULL,
    password VARCHAR(255) NOT NULL,
    industry_type VARCHAR(100) NOT NULL,
    company_size VARCHAR(50) NOT NULL,
    founded_year INT NOT NULL,
    website VARCHAR(255) DEFAULT NULL,
    description TEXT DEFAULT NULL,
    country VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    full_address VARCHAR(255) NOT NULL,
    pin_code VARCHAR(50) DEFAULT NULL,
    otp VARCHAR(10) DEFAULT NULL,
    verified TINYINT(1) DEFAULT 0,
    status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. OTP Verifications Table (Backup)
CREATE TABLE otp_verifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    otp_code VARCHAR(10) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Job Listings Table
CREATE TABLE jobs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    type ENUM('Internship', 'Full-Time', 'Part-Time') NOT NULL DEFAULT 'Internship',
    location VARCHAR(255) NOT NULL,
    stipend VARCHAR(100) NOT NULL,
    duration VARCHAR(100) NOT NULL,
    cgpa_required DECIMAL(4, 2) DEFAULT 0.00,
    skills_required TEXT NOT NULL, -- JSON array
    deadline DATE NOT NULL,
    description TEXT NOT NULL,
    status ENUM('Active', 'Closed') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Applications Table
CREATE TABLE applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    job_id INT NOT NULL,
    student_id INT NOT NULL,
    status ENUM('Applied', 'Under Review', 'Shortlisted', 'Interview Scheduled', 'Accepted', 'Rejected') DEFAULT 'Applied',
    recruiter_notes TEXT DEFAULT NULL,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    UNIQUE KEY unique_application (job_id, student_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Real-Time Chat Messages Table
CREATE TABLE messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT NOT NULL,
    sender_role ENUM('student', 'company', 'admin') NOT NULL,
    receiver_id INT NOT NULL,
    receiver_role ENUM('student', 'company', 'admin') NOT NULL,
    message_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. Interview Scheduler Table
CREATE TABLE interviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    application_id INT NOT NULL,
    student_id INT NOT NULL,
    company_id INT NOT NULL,
    job_id INT NOT NULL,
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NOT NULL,
    status ENUM('Scheduled', 'Rescheduled', 'Completed', 'Cancelled') DEFAULT 'Scheduled',
    meeting_link VARCHAR(255) NOT NULL,
    notes TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================================================
-- SEED DATA FOR DEMO & TESTING
-- ========================================================

-- Seed Moderator / Admin (admin@internedge.edu / password123)
INSERT INTO admins (id, name, email, password) VALUES
(1, 'Super Admin', 'admin@internedge.edu', '$2y$10$wH60pIecf2W0s9C1K3d5e.cM86gV2i/4K5QoBsn2d2dI8B3N.');

-- Seed Student (Aarav Sharma) with password 'password123'
INSERT INTO students (id, fullname, email, mobile, password, dob, gender, college, course, semester, branch, graduation_year, cgpa, skills, experience, portfolio, linkedin, github, verified) VALUES
(1, 'Aarav Sharma', 'demo.student@internedge.edu', '+91 9876543210', '$2y$10$wH60pIecf2W0s9C1K3d5e.cM86gV2i/4K5QoBsn2d2dI8B3N.', '2004-05-15', 'Male', 'Indian Institute of Technology, Delhi', 'BTech', 'Semester 6 (Year 3)', 'Computer Science & Engineering', 2025, '8.85', '["React", "Node.js", "JavaScript", "Python", "SQL"]', 'Intermediate', 'https://aaravsharma.dev', 'https://linkedin.com/in/aaravsharma', 'https://github.com/aaravsharma', 1);

-- Seed Companies with password 'password123' (Approved & Pending)
INSERT INTO companies (id, company_name, email, contact, password, industry_type, company_size, founded_year, website, description, country, state, city, full_address, verified, status) VALUES
(1, 'TechCorp Global Solutions', 'hr@techcorp.com', '+91 9988776655', '$2y$10$wH60pIecf2W0s9C1K3d5e.cM86gV2i/4K5QoBsn2d2dI8B3N.', 'IT', '10-50', 2015, 'https://techcorpglobal.com', 'We are a global IT and software development enterprise bridging student talent with practical industrial opportunities.', 'India', 'Karnataka', 'Bengaluru', '4th Block, Koramangala', 1, 'Approved'),
(2, 'Innovate AI Labs', 'recruitment@innovate.io', '+91 9123456789', '$2y$10$wH60pIecf2W0s9C1K3d5e.cM86gV2i/4K5QoBsn2d2dI8B3N.', 'IT', '10-50', 2021, 'https://innovate.io', 'Leading artificial intelligence research and products lab focusing on natural language processing.', 'India', 'Telangana', 'Hyderabad', 'HITEC City', 1, 'Approved'),
(3, 'Pending Startup Corp', 'hr@pendingstartup.com', '+91 9999911111', '$2y$10$wH60pIecf2W0s9C1K3d5e.cM86gV2i/4K5QoBsn2d2dI8B3N.', 'IT', '1-10', 2025, 'https://pending.io', 'A fresh startup waiting to be verified by campus admin moderators.', 'India', 'Maharashtra', 'Mumbai', 'Andheri West', 1, 'Pending');

-- Seed Jobs
INSERT INTO jobs (id, company_id, company_name, title, type, location, stipend, duration, cgpa_required, skills_required, deadline, description) VALUES
(1, 1, 'TechCorp Global Solutions', 'Frontend Developer Intern (React/Next.js)', 'Internship', 'Remote', '₹25,000 / month', '6 Months', 7.50, '["React", "Next.js", "CSS3", "JavaScript", "Git"]', '2026-07-30', 'We are seeking an enthusiastic Frontend Developer Intern with strong command over React and modern UI dynamics. You will work directly on customer-facing dashboards and design systems.'),
(2, 1, 'TechCorp Global Solutions', 'Full Stack Software Engineer', 'Full-Time', 'Bengaluru, India (Hybrid)', '₹12,000,000 / year', 'Permanent', 8.00, '["Node.js", "Express", "React", "MySQL", "Docker"]', '2026-08-15', 'Full-stack position for graduating seniors. Architect scalable web services and cloud-native applications.'),
(3, 2, 'Innovate AI Labs', 'AI / ML Engineering Intern', 'Internship', 'Hyderabad, India', '₹35,000 / month', '3 Months', 8.50, '["Python", "PyTorch", "Data Science", "SQL", "Machine Learning"]', '2026-07-25', 'Opportunity to work on state-of-the-art Generative AI and Machine Learning models. Experience with Python LLM fine-tuning is a major bonus.');

-- Seed Application
INSERT INTO applications (id, job_id, student_id, status, recruiter_notes) VALUES
(1, 1, 1, 'Shortlisted', 'Impressive portfolio projects. Technical screening scheduled for Friday.');

-- Seed Chat Message
INSERT INTO messages (id, sender_id, sender_role, receiver_id, receiver_role, message_text) VALUES
(1, 1, 'company', 1, 'student', 'Hi Aarav, we reviewed your application and would love to schedule a quick chat. Let us know your availability!');

-- Seed Interview
INSERT INTO interviews (id, application_id, student_id, company_id, job_id, scheduled_date, scheduled_time, status, meeting_link, notes) VALUES
(1, 1, 1, 1, 1, '2026-07-03', '11:00:00', 'Scheduled', 'https://meet.google.com/abc-defg-hij', 'Initial technical round focusing on React fundamentals and CSS layouts.');
