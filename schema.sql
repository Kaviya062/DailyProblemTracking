-- ==============================================================================
-- DAILY PROBLEM RECORDING AND ANALYSIS SYSTEM
-- Supabase / PostgreSQL Database Schema & Initial Seed Data
-- ==============================================================================
-- 
-- Instructions for Supabase:
-- 1. Log in to https://supabase.com and create a new project.
-- 2. Go to the "SQL Editor" tab from the left sidebar.
-- 3. Click "New Query", paste this entire script, and click "Run".
-- ==============================================================================

-- 1. Enable UUID Extension (built into PostgreSQL)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- TABLE 1: DEPARTMENTS
-- Stores college operational departments (IT, Maintenance, Hostel, etc.)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(20) NOT NULL UNIQUE,
    contact_email VARCHAR(120),
    head_of_department VARCHAR(100),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- TABLE 2: STUDENTS
-- Stores student directory and department affiliations
-- ==============================================================================
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    roll_number VARCHAR(50) NOT NULL UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    department_name VARCHAR(100) NOT NULL,
    year_of_study INT DEFAULT 1,
    contact_number VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- TABLE 3: PROBLEMS (COMPLAINTS)
-- Master records for all daily campus issues reported
-- ==============================================================================
CREATE TABLE IF NOT EXISTS problems (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id VARCHAR(20) NOT NULL UNIQUE,               -- e.g. PRB-1001
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,                      -- e.g. IT & Computer Labs
    priority VARCHAR(20) NOT NULL DEFAULT 'Medium',      -- Low, Medium, High, Critical
    location VARCHAR(200) NOT NULL,                      -- e.g. Block B, Lab 304
    reporter_name VARCHAR(100) NOT NULL,
    reporter_id VARCHAR(50) NOT NULL,                    -- Student roll no or email
    description TEXT NOT NULL,
    attachment_hint VARCHAR(255),
    status VARCHAR(30) NOT NULL DEFAULT 'Pending',       -- Pending, In Progress, Resolved
    assigned_dept VARCHAR(100) NOT NULL,                 -- Department attending to issue
    staff_remarks TEXT DEFAULT '',                       -- Notes entered by staff
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index frequently queried columns for fast search and filtering
CREATE INDEX IF NOT EXISTS idx_problems_status ON problems(status);
CREATE INDEX IF NOT EXISTS idx_problems_category ON problems(category);
CREATE INDEX IF NOT EXISTS idx_problems_priority ON problems(priority);
CREATE INDEX IF NOT EXISTS idx_problems_assigned_dept ON problems(assigned_dept);

-- ==============================================================================
-- AUTOMATIC 'updated_at' TRIGGER
-- Updates the 'updated_at' timestamp automatically whenever a problem is modified
-- ==============================================================================
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_problems_timestamp ON problems;
CREATE TRIGGER trigger_update_problems_timestamp
BEFORE UPDATE ON problems
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) FOR HACKATHON PROTOTYPE
-- Allows anonymous read/write with Supabase public anon key for simple frontend demo
-- ==============================================================================
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE problems ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first to prevent "already exists" errors if re-run
DROP POLICY IF EXISTS "Public Read Access for Departments" ON departments;
DROP POLICY IF EXISTS "Public Read Access for Students" ON students;
DROP POLICY IF EXISTS "Public Read Access for Problems" ON problems;
DROP POLICY IF EXISTS "Public Insert for Problems" ON problems;
DROP POLICY IF EXISTS "Public Update for Problems" ON problems;
DROP POLICY IF EXISTS "Public Delete for Problems" ON problems;

-- Allow public read access (Anyone can view records in demo)
CREATE POLICY "Public Read Access for Departments" ON departments FOR SELECT USING (true);
CREATE POLICY "Public Read Access for Students" ON students FOR SELECT USING (true);
CREATE POLICY "Public Read Access for Problems" ON problems FOR SELECT USING (true);

-- Allow public insert and update for problems
CREATE POLICY "Public Insert for Problems" ON problems FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update for Problems" ON problems FOR UPDATE USING (true);
CREATE POLICY "Public Delete for Problems" ON problems FOR DELETE USING (true);

-- ==============================================================================
-- SAMPLE INITIAL DATA SEEDING
-- Populate default college data so your dashboards are immediately active
-- ==============================================================================

-- 1. Seed Departments
INSERT INTO departments (name, code, contact_email, head_of_department, description)
VALUES
('IT & Computer Labs', 'IT', 'it.support@apex.edu', 'Prof. Vikash Patel', 'Campus computers, servers, projectors and Wi-Fi networks'),
('Maintenance & Estate', 'ESTATE', 'estate.office@apex.edu', 'Prof. S. Rao', 'Civil repairs, furniture, carpentry and painting'),
('Hostel & Mess', 'HOSTEL', 'warden.central@apex.edu', 'Dr. Ramesh Kumar', 'Hostel accommodations, water coolers, and dining halls'),
('Library Services', 'LIB', 'library@apex.edu', 'Mrs. Sunita Joshi', 'Study halls, book circulation, and e-learning facilities'),
('Electrical & Power', 'ELEC', 'electrical@apex.edu', 'Er. Mohan Das', 'Substations, campus lighting, switchboards and power backups'),
('Sanitation & Water', 'SAN', 'cleanliness@apex.edu', 'Mr. Rajesh Mehra', 'Drinking water pipelines, plumbing, and housekeeping'),
('Academics & Exams', 'ACAD', 'dean.academics@apex.edu', 'Dr. Vikram Sharma', 'Lecture halls, audio systems, and examination logistics'),
('Campus Transport', 'TRANS', 'transport@apex.edu', 'Mr. Dilip Singh', 'College buses, shuttle vans, and parking facilities')
ON CONFLICT (name) DO NOTHING;

-- 2. Seed Sample Students
INSERT INTO students (roll_number, full_name, email, department_name, year_of_study)
VALUES
('2024BCSE102', 'Rahul Sharma', 'rahul.cse24@apex.edu', 'Computer Science & Eng', 3),
('2023BME045', 'Amit Verma', 'amit.me23@apex.edu', 'Mechanical Engineering', 2),
('2023BECE088', 'Sneha Patel', 'sneha.ece23@apex.edu', 'Electronics & Comm', 4),
('2024BBT019', 'Priya Nair', 'priya.bt24@apex.edu', 'Biotechnology', 3),
('2025BCIV012', 'Ananya Sen', 'ananya.civ25@apex.edu', 'Civil Engineering', 1),
('2024BEEE065', 'Karthik Rao', 'karthik.eee24@apex.edu', 'Electrical Engineering', 3)
ON CONFLICT (roll_number) DO NOTHING;

-- 3. Seed Realistic Campus Problems / Complaints
INSERT INTO problems (ticket_id, title, category, priority, location, reporter_name, reporter_id, description, status, assigned_dept, staff_remarks, attachment_hint)
VALUES
(
    'PRB-1001',
    'Projector HDMI port damaged and ceiling fan wobbling',
    'IT & Computer Labs',
    'High',
    'APJ Abdul Kalam Block, 3rd Floor, Lab 304',
    'Rahul Sharma (CSE-03)',
    '2024BCSE102',
    'During the Machine Learning lab session, the ceiling-mounted projector HDMI port broke. Also, the overhead fan directly above workstation 14 is making a loud rattling noise.',
    'In Progress',
    'IT & Computer Labs',
    'IT Technician Vikash inspected at 11:15 AM. Ordered new HDMI wall plate; repair scheduled by 4:00 PM today.',
    'Image registered with lab attendant.'
),
(
    'PRB-1002',
    'Water pipe joint burst causing floor flooding',
    'Maintenance & Estate',
    'Critical',
    'Boys Hostel 2 (Narmada), 2nd Floor Washroom',
    'Amit Verma (ME-02)',
    '2023BME045',
    'The main inlet PVC pipe joint in washroom B broke at 7 AM. Water is overflowing into the corridor, creating a slipping hazard near room 214.',
    'Pending',
    'Maintenance & Estate',
    '',
    'Warden notified via WhatsApp.'
),
(
    'PRB-1003',
    'Campus WiFi router dropping connection intermittently',
    'IT & Computer Labs',
    'Medium',
    'Central Library, 2nd Floor Reading Room',
    'Sneha Patel (ECE-04)',
    '2023BECE088',
    'The Access Point "Apex-Lib-West" keeps disconnecting every 5-10 minutes. More than 40 students studying for semester exams cannot access digital journals.',
    'In Progress',
    'IT & Computer Labs',
    'Network team diagnosed IP pool exhaustion on DHCP server. Firmware upgrade pending.',
    'Ping test screenshot taken.'
),
(
    'PRB-1004',
    'Commercial Water Cooler cooling unit failed',
    'Hostel & Mess',
    'High',
    'Girls Hostel 1 (Ganga) Ground Floor Dining Hall',
    'Priya Nair (BT-03)',
    '2024BBT019',
    'The main drinking water cooler is dispensing warm water since yesterday evening. Compressor makes humming sounds without cooling.',
    'Resolved',
    'Hostel & Mess',
    'Refrigeration technician replaced faulty thermostat and recharged refrigerant gas. Tested water temperature at 14°C.',
    ''
),
(
    'PRB-1005',
    'Bench frame cracked and protruding sharp metal edge',
    'Maintenance & Estate',
    'Medium',
    'Mechanical Block, Lecture Hall 102 (Row 4)',
    'Rahul Sharma (CSE-03)',
    '2024BCSE102',
    'The wooden seat has detached from the cast iron frame. A sharp metal edge tore a student jacket today during the morning lecture.',
    'Pending',
    'Maintenance & Estate',
    '',
    ''
),
(
    'PRB-1006',
    'Flickering LED tube lights and power socket failure',
    'Electrical & Power',
    'Low',
    'Aryabhatta Science Block, Room 205',
    'Ananya Sen (CIVIL-01)',
    '2025BCIV012',
    'Two tube lights are constantly flickering, causing eye strain during evening tutorial sessions. Switchboard 3 also has no power.',
    'Resolved',
    'Electrical & Power',
    'Electrician Mr. Ram switched out the burnt choke ballast and rewired terminal 3.',
    ''
)
ON CONFLICT (ticket_id) DO NOTHING;
