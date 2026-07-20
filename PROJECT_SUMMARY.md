# StaffSpire Project Summary

> **Generated:** July 2025  
> **Repository:** StaffSpire Employee Management System  
> **Branch:** `main` (up to date with `origin/main`)

---

## 1. Project Overview

**StaffSpire** is a full-stack Employee Management System (HRIS) designed for multi-role workforce management. It supports **Admins**, **Managers**, and **Employees** with distinct dashboards, permissions, and workflows. The application covers the complete employee lifecycle — from onboarding and attendance tracking to leave management, task assignment, and reporting.

---

## 2. Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 19, Vite, React Router DOM 7, Axios, Chart.js, Tailwind CSS 4 |
| **Backend** | Node.js 20, Express 5, MySQL2, JWT |
| **Security** | bcryptjs (password hashing), JWT (stateless auth), CORS, role-based middleware |
| **Reports** | PDFKit (PDF), ExcelJS (Excel), custom CSV generator |
| **Email** | Nodemailer (OTP reset, task/leave notifications, contact form) |
| **Scheduling** | node-cron (auto-mark absents at 08:45 AM, auto-checkout at 22:30) |
| **DevOps** | GitHub Actions CI (backend tests + frontend build) |

---

## 3. Architecture

```
StaffSpire/
├── backend/
│   ├── config/           # DB pool config, mail transporter
│   ├── controllers/      # 12 controllers (auth, employee, attendance, leave, task, report, notification, dashboard x3, department, office settings)
│   ├── middleware/       # JWT auth protector, role guards (adminOnly, managerOnly, employeeOnly, adminOrManager)
│   ├── routes/           # 11 route modules
│   ├── utils/            # Token generator, crypto helpers, email helper, CSV/Excel/PDF generators
│   ├── server.js         # Entry point (port 5000)
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── auth/         # Login, Register Admin, Forgot/Reset Password, OTP Verify
│   │   ├── pages/
│   │   │   ├── public/   # Home, Features, Solutions, About, Contact
│   │   │   ├── admin/    # Dashboard, Employees, Attendance, Leaves, Tasks, Departments, Reports, Settings
│   │   │   ├── manager/  # Manager Dashboard
│   │   │   ├── employee/ # Dashboard, Profile, Attendance, Leaves, Tasks
│   │   │   ├── reports/  # Reports Dashboard with filters & exports
│   │   │   └── layouts/  # Sidebar, Header, Footer, Dashboard Layout
│   │   ├── components/   # Reusable UI (modals, alerts, scroll-to-top)
│   │   ├── hooks/        # useScrollReveal
│   │   ├── assets/       # Logo, dashboard images, public page visuals
│   │   ├── styles/       # 17 CSS modules (global, per-page, per-dashboard)
│   │   ├── App.jsx       # Route definitions (28 routes)
│   │   └── main.jsx      # React root entry
│   ├── index.html
│   └── package.json
├── .github/workflows/    # CI pipeline
├── README.md
└── package.json          # Workspace root
```

---

## 4. Core Features

### 4.1 Authentication & Authorization
- **Multi-role login** via email or Employee ID (`EM####SS` format)
- **JWT-based auth** with 7-day token expiry
- **Role middleware**: Admin, Manager, Employee — with combined `adminOrManager` guard
- **Password recovery**: 6-digit OTP sent via email, 10-minute expiry
- **Admin registration**: First admin can self-register; subsequent admins require existing admin authorization
- **Force password change** flag for newly created employees

### 4.2 Employee Management
- **CRUD operations** with auto-generated `EM####SS` Employee IDs
- **Custom Employee ID / Password** support at creation time
- **One-manager-per-department** enforcement
- **Password reveal**: Admin must re-authenticate with their own password to decrypt and view an employee's plaintext password
- **Manager scope restriction**: Managers can only view/edit employees in their own department
- **Department-change workflow**: When changing an employee's department, active tasks can be reassigned or retained via a confirmation dialog

### 4.3 Attendance Tracking
- **Check-in / Check-out** with real-time status calculation
- **Status auto-detection**: Present, Late (after 09:15), Half Day (< 4 hours), Absent
- **Time windows**: Check-in 08:45–14:00; Check-out 08:45–22:30
- **Weekend blocking**: Saturdays & Sundays are holidays (no check-in allowed)
- **Leave blocking**: Employees on approved leave cannot check in
- **Auto-mark absent**: Cron job at 08:45 AM marks all non-checked-in active employees as absent (skips weekends and employees on leave)
- **Auto-checkout**: At 22:30, any open check-ins are force-checked-out with capped working hours
- **Admin force checkout**: Admins can check out employees manually
- **Geofence**: Configurable office radius with Haversine distance calculation *(currently disabled in production code)*

### 4.4 Leave Management
- **Apply leave**: Employees select leave type, date range, and reason
- **Approval workflow**: Pending → Approved / Rejected; includes rejection remarks
- **Cancellation**: Pending requests can be deleted; Approved requests enter "Pending Cancellation" state requiring admin approval
- **Manager/Admin approval**: Managers can only act on their department; cannot approve their own requests
- **Email + in-app notifications** sent to department manager (or fallback admin) on new leave applications

### 4.5 Task Management
- **Create & assign** tasks with priority (Low/Medium/High), deadline, department
- **Status tracking**: Pending → In Progress → On Hold → Completed (with overdue auto-detection)
- **Role-based views**: Admin sees all, Manager sees department, Employee sees own
- **Employee updates**: Can only change status and add remarks
- **Admin/Manager updates**: Full edit control including reassignment
- **Email + in-app notifications** on new task assignment
- **Completion date** auto-captured when status set to Completed

### 4.6 Department Management
- **CRUD** departments with employee count aggregation
- **Department Details** page showing employees, manager, and activity
- **Manager assignment** linked to department

### 4.7 Office Settings
- **Geofence configuration**: Office name, latitude, longitude, attendance radius
- Used by attendance module for location validation *(feature logic present, currently disabled)*

### 4.8 Reports & Exports
Five report types, each with filters, summary statistics, and export capability:

| Report | Filters | Exports |
|--------|---------|---------|
| **Employee Registry** | Department, Status, Employment Type, Date Range, Search | CSV, Excel, PDF |
| **Attendance Registry** | Employee, Department, Date Range, Month/Year, Search | CSV, Excel, PDF |
| **Leave Requests** | Department, Employee, Leave Type, Status, Date Range, Search | CSV, Excel, PDF |
| **Task Management** | Employee, Department, Priority, Status, Date Range, Search | CSV, Excel, PDF |
| **Department Summary** | Department | CSV, Excel, PDF |

- **Role-scoped reports**: Managers see only their department; Employees see only their own data
- **Employees blocked from exports**: Organization-wide exports restricted to Admin/Manager

### 4.9 Dashboards

#### Admin Dashboard
- Key stats: Total Employees, Departments, Present Today, Late Today, Absent Today, Attendance Rate, Pending Leaves, Active Tasks
- Department distribution doughnut chart
- Pending leave requests list (top 5)
- Recent activity feed (attendance, leaves, tasks)
- Attendance trend chart (last 5 working days)

#### Manager Dashboard
- Department-scoped version of admin stats
- Team attendance, task, and leave summaries

#### Employee Dashboard
- Personal attendance summary
- Upcoming tasks, leave balance view, recent check-in status

### 4.10 Public Marketing Pages
- **Home**: Hero section, feature highlights, stats, trusted carousel, workflow, CTA, footer
- **Features**: Detailed capability breakdown
- **Solutions**: Use-case oriented presentation
- **About**: Company story with real images
- **Contact**: Contact form with integrated map image (SF HQ)

---

## 5. Database Schema (Inferred)

| Table | Purpose |
|-------|---------|
| `users` | Login accounts (id, name, email, password, role_id, login_id, status, must_change_password, reset_otp, otp_expiry) |
| `roles` | Role definitions (Admin=1, Manager=2, Employee=3) |
| `employees` | Employee profiles (personal info, department, designation, salary, joining_date, employee_id, encrypted password) |
| `departments` | Department names |
| `attendance` | Daily attendance records (check_in, check_out, working_hours, status, attendance_date) |
| `leave_requests` | Leave applications (type, dates, reason, status, rejection_remarks) |
| `leave_types` | Leave type catalog |
| `tasks` | Task assignments (title, description, assigned_by, employee_id, priority, status, deadline, completion_date, remarks, task_id) |
| `office_settings` | Geofence config (latitude, longitude, radius) |
| `notifications` | In-app notification bell items (user_id, title, message, is_read) |

---

## 6. Security Measures

- **Password hashing**: bcrypt with 10 salt rounds
- **Encrypted employee passwords**: Custom crypto helper for reversible storage (for admin reveal feature)
- **JWT authentication**: Stateless tokens with role embedding
- **Parameterized queries**: All SQL via MySQL2 prepared statements (SQL injection protection)
- **Role-based access control**: Granular middleware on every protected route
- **Manager self-protection**: Managers cannot approve their own leaves or edit their own employee records
- **Admin auth for sensitive ops**: Password reveal requires admin re-authentication

---

## 7. Recent Development Activity

Recent commits (latest → oldest):

| Commit | Description |
|--------|-------------|
| `71bb1cf` | Fixed task reassignment issue when employee department is changed |
| `de8f99b` | Updated employee task UI to match manager dashboard edit UI |
| `db7e75b` | Added theme toggle features for dashboard |
| `36f4913` | Fixed page scroll issue; prevented force checkout of absent employees |
| `77d1f60` | Updated public page images |
| `e7b50de` | Contact page updated with SF Headquarters map image |
| `e968ef8` | Solutions page real images updated |
| `4e9b96e` | About page images added instead of CSS mockups |
| `f1474cd` | Features page upgraded |

**Trend**: Recent work focused on **UI/UX polish** (real images replacing mockups, theme toggle, page scrolling), **task management refinements**, and **attendance edge-case fixes**.

---

## 8. Current Status & Known Notes

| Aspect | Status |
|--------|--------|
| **Git working tree** | Clean (no uncommitted code changes) |
| **Branch** | `main` — up to date with `origin/main` |
| **Geofence / GPS validation** | **Temporarily disabled** in attendance check-in/out (code commented out; office settings still configurable) |
| **CI/CD** | GitHub Actions configured; backend tests run against MySQL 8.0 service; frontend builds with Vite |
| **Email delivery** | Configured via Nodemailer (credentials in `.env`) |
| **Production build** | Frontend `dist/` folder exists (pre-built) |

---

## 9. API Endpoints Summary

| Base Path | Description |
|-----------|-------------|
| `POST /api/auth/login` | Login with email or Employee ID |
| `POST /api/auth/register` | Register new user |
| `POST /api/auth/forgot-password` | Send OTP to email |
| `POST /api/auth/verify-otp` | Verify OTP code |
| `POST /api/auth/reset-password` | Reset password with OTP |
| `POST /api/auth/change-password` | Change password (authenticated) |
| `POST /api/auth/register-admin` | Register admin (with auth check) |
| `GET /api/auth/check-admin` | Check if any admin exists |
| `POST /api/auth/contact` | Contact form submission |
| `GET /api/employees` | List employees (Admin: all, Manager: dept) |
| `POST /api/employees` | Create employee (Admin/Manager) |
| `GET /api/employees/:id` | Get employee details |
| `PUT /api/employees/:id` | Update employee |
| `DELETE /api/employees/:id` | Delete employee |
| `POST /api/employees/:id/reveal-password` | Reveal employee password (admin auth required) |
| `GET /api/attendance/today` | Today's attendance status |
| `POST /api/attendance/check-in` | Employee check-in |
| `POST /api/attendance/check-out` | Employee check-out |
| `GET /api/attendance/history` | Personal attendance history |
| `GET /api/attendance` | All attendance records (Admin/Manager scoped) |
| `GET /api/attendance/:employeeId` | Specific employee attendance |
| `POST /api/attendance/admin/check-out` | Admin force checkout |
| `GET /api/leaves/types` | Leave type dropdown |
| `POST /api/leaves/apply` | Apply for leave |
| `GET /api/leaves/history` | Personal leave history |
| `DELETE /api/leaves/cancel/:id` | Cancel leave request |
| `GET /api/leaves/admin/requests` | Admin/Manager leave requests list |
| `POST /api/leaves/admin/action` | Approve/Reject leave |
| `GET /api/leaves/admin/stats` | Leave statistics |
| `POST /api/tasks` | Create task |
| `GET /api/tasks` | List tasks (role-scoped) |
| `GET /api/tasks/my` | Employee's own tasks |
| `GET /api/tasks/stats` | Task statistics |
| `GET /api/tasks/employees` | Employees for assignment dropdown |
| `GET /api/tasks/:id` | Task detail |
| `PUT /api/tasks/:id` | Update task |
| `DELETE /api/tasks/:id` | Delete task |
| `GET /api/reports/employees` | Employee report data |
| `GET /api/reports/attendance` | Attendance report data |
| `GET /api/reports/leaves` | Leave report data |
| `GET /api/reports/tasks` | Task report data |
| `GET /api/reports/departments` | Department summary report |
| `GET /api/reports/export/csv` | Export CSV |
| `GET /api/reports/export/excel` | Export Excel |
| `GET /api/reports/export/pdf` | Export PDF |
| `GET /api/reports/dashboard-stats` | Dashboard statistics |
| `GET /api/notifications` | User notifications |
| `PUT /api/notifications/:id/read` | Mark notification read |
| `PUT /api/notifications/read-all` | Clear all notifications |
| `GET /api/departments` | List departments |
| `GET /api/office-settings` | Get office geofence settings |
| `PUT /api/office-settings` | Update office settings |

---

## 10. Development Quick Reference

```bash
# Run both frontend and backend concurrently
npm run dev

# Individual services
npm run dev --workspace=backend   # API on :5000
npm run dev --workspace=frontend  # Vite on :5173

# Production
npm run build    # Build frontend
npm run start    # Start backend

# Testing
npm run test --workspace=backend
```

---

*This summary was generated from direct inspection of the codebase, including source files, controllers, routes, middleware, configuration, and git history.*
