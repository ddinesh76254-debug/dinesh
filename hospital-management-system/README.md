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

## 📁 Project Structure

```text
hospital-management-system/
├── frontend/
│   ├── index.html          # Public hospital portal & introduction
│   ├── patient.html        # Patient registration & appointment form
│   ├── appointment.html    # Patient appointment tracking & directory
│   ├── login.html          # Admin authentication screen
│   ├── admin.html          # Admin operations dashboard & CRUD
│   ├── css/
│   │   └── style.css       # Clean medical blue & light cyan styling
│   └── js/
│       ├── main.js         # Shared API utilities & helpers
│       ├── patient.js      # Form validation & dynamic doctor fetch
│       ├── appointment.js  # Live appointment search & filters
│       ├── admin.js        # Admin dashboard metrics & CRUD actions
│       └── login.js        # Admin login & session management
├── backend/
│   ├── server.js           # Express application entry point
│   ├── package.json        # Backend dependencies & scripts
│   ├── .env                # Database & server environment config
│   ├── config/
│   │   └── database.js     # MySQL2 connection pool
│   ├── controllers/
│   │   ├── patientController.js
│   │   ├── doctorController.js
│   │   ├── appointmentController.js
│   │   └── adminController.js
│   ├── models/
│   │   ├── departmentModel.js
│   │   ├── doctorModel.js
│   │   ├── patientModel.js
│   │   └── appointmentModel.js
│   └── routes/
│       ├── patientRoutes.js
│       ├── doctorRoutes.js
│       ├── appointmentRoutes.js
│       └── adminRoutes.js
├── database/
│   └── hospital_management.sql  # Database schema & initial seed data
└── README.md
```

---

## ⚙️ Setup Instructions

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **MySQL Server**: v8.0 or higher (or MariaDB)

---

### 2. Database Installation & Configuration

1. Start your local MySQL server.
2. Open your terminal or MySQL command line client and log in:
   ```bash
   mysql -u root -p
   ```
3. Import the SQL file to create the `hospital_management` database, tables, and sample data:
   ```bash
   mysql -u root -p < database/hospital_management.sql
   ```
   *Or copy and paste the contents of `database/hospital_management.sql` directly into MySQL Workbench / phpMyAdmin.*

---

### 3. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Configure the `.env` file with your MySQL credentials:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=YOUR_ACTUAL_MYSQL_PASSWORD
   DB_NAME=hospital_management
   ```
3. Install backend dependencies:
   ```bash
   npm install
   ```
4. Start the backend server:
   ```bash
   npm start
   ```
   *The backend will boot up at `http://localhost:5000`.*

---

### 4. Frontend Access

Open the `frontend/` folder in your browser:
- Double-click `frontend/index.html`, or serve it with any local static server (e.g., Live Server in VS Code, `npx serve frontend`, or `python3 -m http.server 8080`).
- Visit `http://localhost:8080` (or `file:///.../frontend/index.html`).

---

## 🔑 Default Administrator Credentials

- **Username**: `admin`
- **Password**: `admin123`

---

## 📡 REST API Documentation

### Patients
- `GET /api/patients` - List all registered patients
- `POST /api/patients` - Register a new patient
- `GET /api/patients/:id` - Get patient details by ID
- `PUT /api/patients/:id` - Update patient record
- `DELETE /api/patients/:id` - Delete patient record

### Doctors
- `GET /api/doctors` - List all doctors
- `POST /api/doctors` - Add a doctor
- `GET /api/doctors/:id` - Get doctor by ID
- `PUT /api/doctors/:id` - Update doctor info
- `DELETE /api/doctors/:id` - Delete doctor
- `GET /api/doctors/department/:department` - Dynamically fetch doctors for a specific department (e.g. `Cardiology`)

### Appointments
- `GET /api/appointments` - List all appointments
- `POST /api/appointments` - Book appointment (handles patient intake + doctor assignment)
- `GET /api/appointments/:id` - Get appointment details
- `PUT /api/appointments/:id` - Update status (`Approved`, `Cancelled`, `Completed`)
- `DELETE /api/appointments/:id` - Delete appointment

### Admin & Utilities
- `POST /api/admin/login` - Authenticate admin credentials with bcrypt
- `GET /api/admin/stats` - Metric summaries for admin dashboard
- `GET /api/departments` - List all clinical departments
