# StaffSpire Project Summary

> **Generated:** July 2026  
> **Repository:** StaffSpire Employee Management System  
> **Branch:** `main`

---

## 1. Project Overview

**StaffSpire** is a full-stack Employee Management System (HRIS) designed for multi-role workforce management. It supports **Admins**, **Managers**, and **Employees** with distinct dashboards, permissions, and workflows. The application covers the complete employee lifecycle — from onboarding and attendance tracking to leave management, task assignment, and reporting.

---

## 2. Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 19, Vite 8, React Router DOM 7, Axios, Chart.js, SWR, Tailwind CSS 4 (installed, mostly unused), React Icons |
| **Backend** | Node.js 20, Express 5, MySQL2 (promise wrapper), JWT, bcryptjs, node-cron |
| **Security** | bcryptjs (password hashing), JWT (stateless auth), AES-256-CBC (employee password encryption), CORS, role-based middleware |
| **Reports** | PDFKit (PDF), ExcelJS (Excel), custom CSV generator |
| **Email** | Nodemailer (OTP reset, task/leave notifications, contact form) — graceful fallback to mock_emails.log |
| **Scheduling** | node-cron (auto-mark absents at 08:45, auto-checkout at 22:30, weekend & leave-aware) |
| **DevOps** | GitHub Actions CI (backend + frontend jobs), React Doctor workflow |

---

## 3. Architecture

```
StaffSpire/
├── backend/
│   ├── config/             # DB pool config, mail transporter
│   ├── controllers/        # 13 controllers (auth, employee, attendance, leave, task, project, report, notification, adminDashboard, employeeDashboard, managerDashboard, department, officeSettings)
│   ├── middleware/         # JWT auth protector, role guards (adminOnly, managerOnly, employeeOnly, adminOrManager)
│   ├── routes/             # 12 route modules
│   ├── utils/              # Token generator, AES-256-CBC crypto helpers, email helper (mock fallback), CSV/Excel/PDF generators
│   ├── scripts/            # DB migration scripts
│   ├── server.js           # Entry point (port 5000)
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── auth/           # Login, Register Admin, Forgot/Reset Password, OTP Verify
│   │   ├── pages/
│   │   │   ├── public/     # Home, Features, Solutions, About, Contact
│   │   │   ├── admin/      # Dashboard, Employees, Attendance, Leaves, Tasks, Projects, Departments, Alerts
│   │   │   ├── manager/    # Manager Dashboard
│   │   │   ├── employee/   # Dashboard, Profile, Attendance, Leaves, Tasks
│   │   │   ├── reports/    # Reports Dashboard with filters & exports
│   │   │   ├── settings/   # Settings page + tabs
│   │   │   └── layouts/    # Sidebar, Header, Footer, Dashboard Layout
│   │   ├── components/     # Reusable UI (modals, alerts, scroll-to-top)
│   │   ├── hooks/          # useScrollReveal
│   │   ├── assets/         # Logo, dashboard images, public page visuals
│   │   ├── styles/         # 16 CSS modules (global, per-page, per-dashboard)
│   │   ├── App.jsx         # Route definitions (32 routes)
│   │   └── main.jsx        # React root entry
│   ├── dist/               # Pre-built production bundle
│   ├── index.html
│   └── package.json
├── .github/workflows/      # CI pipeline + React Doctor
├── README.md
├── PROJECT_SUMMARY.md
├── package.json            # Workspace root
└── StaffSpire*.pdf/docx    # Requirements docs
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
- **Create & assign** tasks with priority (Low/Medium/High), deadline, department, and optional project association
- **Status tracking**: Pending → In Progress → On Hold → Completed (with overdue auto-detection)
- **Role-based views**: Admin sees all, Manager sees department, Employee sees own
- **Employee updates**: Can only change status and add remarks
- **Admin/Manager updates**: Full edit control including reassignment
- **Email + in-app notifications** on new task assignment
- **Completion date** auto-captured when status set to Completed

### 4.6 Project Management
- **CRUD** projects with code generation (`PRJ####`), color coding, and icons
- **Member management**: Add/remove employees to projects
- **Milestone tracking**: Create, update, complete milestones with due dates
- **Progress calculation**: Auto-computed completion % from linked tasks
- **Analytics dashboard**: Project stats, department distribution, average progress

### 4.7 Department Management
- **CRUD** departments with employee count aggregation
- **Department Details** page showing employees list, manager, and employee count
- **Manager assignment** linked to department

### 4.8 Office Settings
- **Geofence configuration**: Office name, latitude, longitude, attendance radius
- Used by attendance module for location validation *(feature logic present, currently disabled)*

### 4.9 Reports & Exports
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

### 4.10 Dashboards

#### Admin Dashboard
- Key stats: Total Employees, Departments, Present Today, Late Today, Absent Today, Attendance Rate, Pending Leaves, Active Tasks
- Department distribution doughnut chart
- Pending leave requests list (top 5)
- Recent activity feed (attendance, leaves, tasks)
- Attendance trend chart (last 5 working days)

#### Manager Dashboard
- Department-scoped version of admin stats
- Team attendance, task, and leave summaries
- Project progress tracking

#### Employee Dashboard
- Personal attendance summary with working hours progress bar
- Upcoming tasks with priority and deadline indicators
- Leave balance (annual allowance vs. taken)
- 14-day attendance heatmap
- Team members and manager info
- Recent activity log

### 4.11 Public Marketing Pages
- **Home**: Hero section, feature highlights, stats, trusted carousel, workflow, CTA, footer
- **Features**: Detailed capability breakdown
- **Solutions**: Use-case oriented presentation
- **About**: Company story with real images
- **Contact**: Contact form with integrated map image (SF HQ)

### 4.12 In-App Notifications
- **Notification bell** with unread count
- **Auto-created** on new leave requests (for manager/admin)
- **Auto-created** on new task assignment (for assignee)
- **Mark as read** (individual) and **clear all** actions

---

## 5. Database Schema (Inferred)

| Table | Purpose |
|-------|---------|
| `users` | Login accounts (id, name, email, password, role_id, login_id, status, must_change_password, reset_otp, otp_expiry) |
| `roles` | Role definitions (Admin=1, Manager=2, Employee=3) |
| `employees` | Employee profiles (personal info, department, designation, salary, joining_date, employee_id, encrypted password, date_of_birth, probation_period) |
| `departments` | Department names |
| `attendance` | Daily attendance records (check_in, check_out, working_hours, status, attendance_date) |
| `leave_requests` | Leave applications (type, dates, reason, status, rejection_remarks) |
| `leave_types` | Leave type catalog |
| `tasks` | Task assignments (title, description, assigned_by, assigned_by_user_id, employee_id, priority, status, deadline, completion_date, remarks, task_id, project_id) |
| `projects` | Projects (name, description, department, manager, priority, dates, color, icon, status, project_code) |
| `project_members` | Project-employee membership |
| `project_milestones` | Milestones (title, description, due_date, status, completion_date) |
| `office_settings` | Geofence config (latitude, longitude, radius) |
| `notifications` | In-app notification bell items (user_id, title, message, is_read) |

---

## 6. Security Measures

- **Password hashing**: bcrypt with 10 salt rounds
- **Encrypted employee passwords**: Custom AES-256-CBC crypto helper for reversible storage (for admin reveal feature)
- **JWT authentication**: Stateless tokens with role embedding
- **Parameterized queries**: All SQL via MySQL2 prepared statements (SQL injection protection)
- **Role-based access control**: Granular middleware on every protected route
- **Manager self-protection**: Managers cannot approve their own leaves or edit their own employee records
- **Admin auth for sensitive ops**: Password reveal requires admin re-authentication

---

## 7. Current Status & Known Issues

| Aspect | Status |
|--------|--------|
| **Geofence / GPS validation** | **Temporarily disabled** in attendance check-in/out (code commented out; office settings still configurable) |
| **CI/CD** | GitHub Actions configured; backend CI will **fail** (missing `lint` and `test` scripts in `package.json`) |
| **Testing** | **None implemented** — no test dependencies, no test directory, CI step will fail |
| **Email delivery** | Configured via Nodemailer (`.env` with real Gmail credentials committed — **rotate immediately**) |
| **Production build** | Frontend `dist/` folder exists (pre-built) |
| **Docker** | Referenced in docs but no `Dockerfile` or `docker-compose.yml` exist |

### Known Issues

| # | Issue | Location | Severity |
|---|-------|----------|----------|
| 1 | **No tests** — CI references `npm test` but no test deps or scripts exist | Backend root | Critical |
| 2 | **`.env` committed** — contains real Gmail app password | `backend/.env` | Critical |
| 3 | **Bug: undefined `distance`** — response references undeclared variable | `attendanceController.js:365` | High |
| 4 | **CI will fail** — `npm run lint` and `npm test` scripts missing from backend | `backend/package.json` | High |
| 5 | **Duplicate helpers** — `getManagerDepartment` (x3), `getEmployeeIdFromUser` (x2), `getEmployeeFromUser` (x3), working-hours calculation (x3) | Multiple controllers | High |
| 6 | **Inline `require()`** — `notificationController` and `emailHelper` loaded inside function bodies | `leaveController.js:94`, `taskController.js:73` | High |
| 7 | **No input validation library** — manual `if (!x)` checks everywhere, `registerUser` returns raw MySQL error | All controllers | High |
| 8 | **No centralized error handler** — 13+ identical try/catch blocks with boilerplate | Every controller | Medium |
| 9 | **Hardcoded API URLs** — `http://localhost:5000` hardcoded in every frontend file | Multiple JSX files | Medium |
| 10 | **Department routes unauthenticated** — `GET /api/departments` and `GET /:id` have no `protect` middleware | `departmentRoutes.js` | Medium |
| 11 | **Response inconsistency** — `departmentController` returns `{ message }` without `success` field | `departmentController.js` | Medium |
| 12 | **Tailwind installed but unused** — `@tailwindcss/vite` in deps but no proxy config; 16 separate CSS files | Frontend | Low |
| 13 | **No rate limiting** on auth endpoints (brute-force protection missing) | Missing entirely | Low |
| 14 | **No HTTP security headers** (Helmet not installed) | Missing entirely | Low |
| 15 | **`adminRoutes` mounted twice** — same routes registered twice on `/api/admin` | `server.js:19-26` | Low |
| 16 | **`dotenv.config()` called twice** | `server.js:1,9` | Low |
| 17 | **`markAllAsRead` deletes instead of marking** — notifications are removed, not marked | `notificationController.js:65` | Low |
| 18 | **`.gitignore` not blocking `.env`** — environment file is tracked | Repository root | Info |

---

## 8. API Endpoints Summary

| Method | Path | Auth | Role |
|--------|------|------|------|
| `POST` | `/api/auth/register` | No | — |
| `GET` | `/api/auth/check-admin-exists` | No | — |
| `POST` | `/api/auth/register-admin` | No | — |
| `POST` | `/api/auth/login` | No | — |
| `GET` | `/api/auth/profile` | JWT | Any |
| `PUT` | `/api/auth/change-password` | JWT | Any |
| `POST` | `/api/auth/forgot-password` | No | — |
| `PUT` | `/api/auth/reset-password` | No | — |
| `POST` | `/api/auth/verify-otp` | No | — |
| `POST` | `/api/auth/contact` | No | — |
| `GET` | `/api/admin/dashboard-stats` | JWT | Admin |
| `GET` | `/api/admin/manager/dashboard-info` | JWT | Admin/Manager |
| `GET` | `/api/employees` | JWT | Admin/Manager |
| `POST` | `/api/employees` | JWT | Admin |
| `GET` | `/api/employees/:id` | JWT | Admin/Manager |
| `PUT` | `/api/employees/:id` | JWT | Admin/Manager |
| `DELETE` | `/api/employees/:id` | JWT | Admin |
| `POST` | `/api/employees/:id/reveal-password` | JWT | Admin |
| `GET` | `/api/employee/dashboard` | JWT | Employee |
| `GET` | `/api/attendance/today` | JWT | Any |
| `POST` | `/api/attendance/check-in` | JWT | Any |
| `POST` | `/api/attendance/check-out` | JWT | Any |
| `GET` | `/api/attendance/history` | JWT | Any |
| `GET` | `/api/attendance` | JWT | Admin/Manager |
| `POST` | `/api/attendance/admin/check-out` | JWT | Admin/Manager |
| `GET` | `/api/attendance/:employeeId` | JWT | Admin/Manager |
| `GET` | `/api/leaves/types` | No | — |
| `POST` | `/api/leaves/apply` | JWT | Any |
| `GET` | `/api/leaves/history` | JWT | Any |
| `DELETE` | `/api/leaves/cancel/:id` | JWT | Any |
| `GET` | `/api/leaves/admin/requests` | JWT | Admin/Manager |
| `POST` | `/api/leaves/admin/action` | JWT | Admin/Manager |
| `GET` | `/api/leaves/admin/stats` | JWT | Admin/Manager |
| `POST` | `/api/tasks` | JWT | Admin/Manager |
| `GET` | `/api/tasks` | JWT | Any (scoped) |
| `GET` | `/api/tasks/my` | JWT | Employee |
| `GET` | `/api/tasks/stats` | JWT | Any (scoped) |
| `GET` | `/api/tasks/employees` | JWT | Admin/Manager |
| `GET` | `/api/tasks/:id` | JWT | Any |
| `PUT` | `/api/tasks/:id` | JWT | Any (scoped) |
| `DELETE` | `/api/tasks/:id` | JWT | Admin |
| `GET` | `/api/projects/analytics` | JWT | Any |
| `POST` | `/api/projects` | JWT | Any |
| `GET` | `/api/projects` | JWT | Any |
| `GET` | `/api/projects/:id` | JWT | Any |
| `PUT` | `/api/projects/:id` | JWT | Any |
| `DELETE` | `/api/projects/:id` | JWT | Any |
| `PUT` | `/api/projects/:id/archive` | JWT | Any |
| `POST` | `/api/projects/members` | JWT | Any |
| `DELETE` | `/api/projects/members` | JWT | Any |
| `POST` | `/api/projects/milestones` | JWT | Any |
| `PUT` | `/api/projects/milestones/:id` | JWT | Any |
| `DELETE` | `/api/projects/milestones/:id` | JWT | Any |
| `GET` | `/api/reports/dashboard-stats` | JWT | Any (scoped) |
| `GET` | `/api/reports/employees` | JWT | Any (scoped) |
| `GET` | `/api/reports/attendance` | JWT | Any (scoped) |
| `GET` | `/api/reports/leaves` | JWT | Any (scoped) |
| `GET` | `/api/reports/tasks` | JWT | Any (scoped) |
| `GET` | `/api/reports/departments` | JWT | Admin/Manager |
| `GET` | `/api/reports/export/csv` | JWT | Admin/Manager |
| `GET` | `/api/reports/export/excel` | JWT | Admin/Manager |
| `GET` | `/api/reports/export/pdf` | JWT | Admin/Manager |
| `GET` | `/api/notifications` | JWT | Any |
| `PUT` | `/api/notifications/:id/read` | JWT | Any |
| `PUT` | `/api/notifications/read-all` | JWT | Any |
| `GET` | `/api/departments` | **None** | — |
| `GET` | `/api/departments/:id` | **None** | — |
| `POST` | `/api/departments` | **None** | — |
| `PUT` | `/api/departments/:id` | **None** | — |
| `DELETE` | `/api/departments/:id` | **None** | — |
| `GET` | `/api/office-settings` | JWT | Any |
| `POST` | `/api/office-settings` | JWT | Admin |

---

## 9. Development Quick Reference

```bash
# Backend
cd backend
npm run dev       # Start with nodemon on :5000
npm start         # Production start

# Frontend
cd frontend
npm run dev       # Vite dev server on :5173
npm run build     # Production build
npm run lint      # ESLint check
npm run preview   # Preview production build

# Testing (not yet implemented)
# cd backend && npm test
```

---

## 10. Upgrade Roadmap (to 9/10)

| Priority | Task | Effort |
|----------|------|--------|
| P0 | Write backend tests (Jest + Supertest) | 2-3 days |
| P0 | Remove `.env` from git, rotate credentials, add to `.gitignore` | 30 min |
| P0 | Fix `undefined distance` bug in `attendanceController.js:365` | 5 min |
| P0 | Add `lint` and `test` scripts to backend `package.json` | 15 min |
| P1 | Extract duplicated helpers into `utils/employeeHelper.js` | 1 day |
| P1 | Install `express-validator`/`zod` for request validation | 1 day |
| P1 | Add Express error-handling middleware | 1 day |
| P1 | Replace inline `require()` with top-level imports | 30 min |
| P1 | Configure Vite proxy, remove hardcoded URLs | 1 day |
| P1 | Add `express-rate-limit` on auth routes | 30 min |
| P1 | Fix unauthenticated department routes | 30 min |
| P1 | Normalize `departmentController` response shape | 30 min |
| P2 | Add Helmet for HTTP security headers | 15 min |
| P2 | Fix duplicate `dotenv.config()` and `adminRoutes` mount | 15 min |
| P2 | Change `markAllAsRead` to update instead of delete | 15 min |
| P3 | Add TypeScript | 3-5 days |
| P3 | Add Docker setup | 1-2 days |
| P3 | Use Tailwind properly or clean up unused deps | 1 day |

---

*This summary was generated from direct inspection of the codebase, including all 13 backend controllers, 12 route files, middleware, configuration, 16 frontend CSS modules, and git history.*
