# Hospital Management System (HMS)

A modern, responsive, full-stack Hospital Management System built with **HTML5, CSS3, JavaScript, Node.js, Express.js, and MySQL**.

Designed for seamless patient appointment bookings, dynamic departmental doctor routing, patient records management, and real-time administrative operations.

---

## 🌟 Key Features

- **Dynamic Departmental Doctor Fetching**: Selecting a department (Cardiology, Orthopedics, Neurology, etc.) automatically queries the backend REST API (`/api/doctors/department/:department`) to populate active doctors without page reloads.
- **Patient Registration & Booking**: Form with validation for patient name, appointment date, address, department, and doctor, returning an instant booking receipt and appointment ID.
- **Appointment Lookup & Status Tracking**: Live search and status filter (`Pending`, `Approved`, `Cancelled`, `Completed`).
- **Secure Admin Portal**:
  - Encrypted administrator authentication using `bcrypt`.
  - Live metric cards: Total Patients, Total Doctors, Total Appointments, Pending Appointments.
  - Complete doctor management: Add Doctor, Edit Doctor, Delete Doctor.
  - Appointment approvals, cancellations, and deletions.
  - Patient roster tracking.
- **Relational MySQL Architecture**: Normalized tables with foreign keys and cascade rules (`departments`, `doctors`, `patients`, `appointments`, `admins`).

---

## 📁 Standalone Directory Structure

All standalone source code is packaged in `hospital-management-system/`:
```text
hospital-management-system/
├── frontend/
│   ├── index.html          # Public hospital portal & introduction
│   ├── patient.html        # Patient registration & appointment form
│   ├── appointment.html    # Patient appointment tracking & directory
│   ├── login.html          # Admin authentication screen
│   ├── admin.html          # Admin operations dashboard & CRUD
│   ├── css/style.css       # Clean medical blue & light cyan styling
│   └── js/                 # main.js, patient.js, appointment.js, admin.js, login.js
├── backend/
│   ├── server.js           # Express application entry point
│   ├── package.json        # Backend dependencies & scripts
│   ├── .env                # Database & server environment config
│   ├── config/database.js  # MySQL2 connection pool
│   ├── controllers/        # patient, doctor, appointment, admin controllers
│   ├── models/             # department, doctor, patient, appointment models
│   └── routes/             # REST routes
├── database/
│   └── hospital_management.sql  # Database schema & initial seed data
└── README.md
```

---

## ⚙️ Quick Setup Guide

1. **MySQL Database**:
   ```bash
   mysql -u root -p < database/hospital_management.sql
   ```
2. **Backend**:
   ```bash
   cd hospital-management-system/backend
   npm install
   npm start
   ```
3. **Admin Credentials**:
   - Username: `admin`
   - Password: `admin123`
