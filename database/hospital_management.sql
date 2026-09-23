-- =====================================================
-- Hospital Management System Database Schema
-- Database: hospital_management
-- =====================================================

CREATE DATABASE IF NOT EXISTS hospital_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE hospital_management;

-- Disable foreign key checks during table creation
SET FOREIGN_KEY_CHECKS = 0;

-- -----------------------------------------------------
-- Table: departments
-- -----------------------------------------------------
DROP TABLE IF EXISTS appointments;
DROP TABLE IF EXISTS doctors;
DROP TABLE IF EXISTS patients;
DROP TABLE IF EXISTS departments;
DROP TABLE IF EXISTS admins;

CREATE TABLE departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    department_name VARCHAR(100) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------
-- Table: doctors
-- -----------------------------------------------------
CREATE TABLE doctors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    doctor_name VARCHAR(100) NOT NULL,
    department_id INT NOT NULL,
    specialization VARCHAR(150) NOT NULL,
    CONSTRAINT fk_doctor_department FOREIGN KEY (department_id) 
        REFERENCES departments(id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------
-- Table: patients
-- -----------------------------------------------------
CREATE TABLE patients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    date DATE NOT NULL,
    address TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------
-- Table: appointments
-- -----------------------------------------------------
CREATE TABLE appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    doctor_id INT NOT NULL,
    appointment_date DATE NOT NULL,
    status ENUM('Pending', 'Approved', 'Cancelled', 'Completed') DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_appointment_patient FOREIGN KEY (patient_id) 
        REFERENCES patients(id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    CONSTRAINT fk_appointment_doctor FOREIGN KEY (doctor_id) 
        REFERENCES doctors(id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------
-- Table: admins
-- -----------------------------------------------------
CREATE TABLE admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- Seed Initial Departments
-- =====================================================
INSERT INTO departments (id, department_name) VALUES
(1, 'Cardiology'),
(2, 'General Medicine'),
(3, 'Orthopedics'),
(4, 'Dermatology'),
(5, 'Pediatrics'),
(6, 'Neurology'),
(7, 'ENT'),
(8, 'Gynecology'),
(9, 'General Surgery');

-- =====================================================
-- Seed Initial Doctors
-- =====================================================
INSERT INTO doctors (id, doctor_name, department_id, specialization) VALUES
(1, 'Dr. Arun', 1, 'Senior Interventional Cardiologist'),
(2, 'Dr. Priya', 1, 'Cardiac Electrophysiologist'),
(3, 'Dr. Sharma', 2, 'Senior Consultant Physician'),
(4, 'Dr. Ananya', 2, 'Internal Medicine Specialist'),
(5, 'Dr. Kumar', 3, 'Joint Replacement & Spine Surgeon'),
(6, 'Dr. Raj', 3, 'Sports Medicine & Arthroscopy Specialist'),
(7, 'Dr. Sneha', 4, 'Consultant Dermatologist & Cosmetologist'),
(8, 'Dr. Meera', 5, 'Senior Pediatrician & Neonatologist'),
(9, 'Dr. Divya', 6, 'Chief Neurologist & Stroke Specialist'),
(10, 'Dr. Vikram', 7, 'Head & Neck ENT Surgeon'),
(11, 'Dr. Kavita', 8, 'Obstetrician & Gynecologist Specialist'),
(12, 'Dr. Suresh', 9, 'Senior Laparoscopic & General Surgeon');

-- =====================================================
-- Seed Sample Patients
-- =====================================================
INSERT INTO patients (id, name, date, address, created_at) VALUES
(1, 'Ramesh Patel', '2026-09-24', '124 MG Road, Indiranagar, Bengaluru', NOW()),
(2, 'Sunita Rao', '2026-09-25', '45 Park Avenue, Adyar, Chennai', NOW()),
(3, 'David Miller', '2026-09-26', '78 Jubilee Hills, Hyderabad', NOW()),
(4, 'Farhan Khan', '2026-09-27', '12 Lake View Residency, Powai, Mumbai', NOW());

-- =====================================================
-- Seed Sample Appointments
-- =====================================================
INSERT INTO appointments (id, patient_id, doctor_id, appointment_date, status, created_at) VALUES
(1, 1, 1, '2026-09-24', 'Approved', NOW()),
(2, 2, 5, '2026-09-25', 'Pending', NOW()),
(3, 3, 9, '2026-09-26', 'Approved', NOW()),
(4, 4, 2, '2026-09-27', 'Pending', NOW());

-- =====================================================
-- Seed Default Admin User
-- Username: admin
-- Password: admin123 (hashed with bcrypt: $2a$10$wT8K8U1nUomZ/rNq5l3d1ea17o81xO7HkM1F18u8h7K7tL/bC6k8O)
-- =====================================================
INSERT INTO admins (id, username, password) VALUES
(1, 'admin', '$2a$10$wT8K8U1nUomZ/rNq5l3d1ea17o81xO7HkM1F18u8h7K7tL/bC6k8O');
