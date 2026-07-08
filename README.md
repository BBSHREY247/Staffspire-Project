# Softspire Employee Management System

A full-stack Employee Management System (HRIS) built with **React + Vite** (frontend) and **Node.js + Express + MySQL** (backend).

[![CI](https://github.com/yourusername/Softspire/actions/workflows/ci.yml/badge.svg)](https://github.com/yourusername/Softspire/actions/workflows/ci.yml)

---

## Features

- **Multi-Role Authentication** — Admin, Manager, Employee with JWT-based auth
- **Employee Management** — CRUD operations, auto-generated Employee IDs, password reveal with admin auth
- **Attendance Tracking** — Check-in/out with working hours calculation, status detection (Present / Late / Half Day)
- **Leave Management** — Apply, approve, reject, cancel leave requests with type-based tracking
- **Task Management** — Create, assign, update tasks with priority, deadline, status tracking, and overdue detection
- **Department Management** — CRUD with employee count aggregation
- **Office Settings** — Geofence configuration for attendance location validation
- **Password Recovery** — OTP-based forgot password flow via email
- **Reports & Exports** — PDF and Excel export capabilities
- **Responsive Dashboard** — Role-based dashboards with stats and analytics

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 19, Vite, React Router DOM, Axios |
| **Backend** | Node.js 20, Express 5, MySQL2, JWT |
| **Security** | Helmet, express-rate-limit, CORS, bcryptjs |
| **Logging** | Winston, Morgan |
| **Docs** | Swagger/OpenAPI |
| **Testing** | Jest, Supertest |
| **DevOps** | Docker, Docker Compose, GitHub Actions |

---

## Project Structure

```
Softspire/
├── backend/
│   ├── config/           # DB, Swagger, Mail config
│   ├── controllers/      # Business logic (9 modules)
│   ├── middleware/       # Auth, Role, Error Handler, Validation, Logger
│   ├── routes/           # API route definitions
│   ├── utils/            # Token generation, crypto helpers
│   ├── tests/            # Jest test suites
│   ├── logs/             # Winston log files
│   ├── server.js         # Entry point
│   ├── Dockerfile
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── auth/         # Auth pages (login, register, forgot password)
│   │   ├── pages/        # Admin, Manager, Employee, Settings pages
│   │   ├── layouts/      # Layout components
│   │   ├── assets/       # Static assets
│   │   └── styles/       # CSS modules
│   ├── index.html
│   ├── vite.config.js
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── docker-compose.yml
├── .github/workflows/ci.yml
├── .gitignore
└── package.json          # Workspace root
```

---

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) >= 18
- [MySQL](https://mysql.com/) 8.0+
- (Optional) [Docker](https://docker.com/) & Docker Compose

### 1. Clone & Install

```bash
git clone <repo-url>
cd Softspire

# Install all workspace dependencies
npm install
```

### 2. Configure Environment

```bash
cp backend/.env.example backend/.env
# Edit backend/.env with your MySQL credentials and JWT secret
```

### 3. Database Setup

Create the MySQL database:

```sql
CREATE DATABASE Softspire CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Then run the schema from `Softspire Employee Management System.pdf` (Section 5).

### 4. Run Development

```bash
# Run both frontend and backend concurrently
npm run dev
```

Or run individually:

```bash
# Terminal 1
npm run dev --workspace=backend

# Terminal 2
npm run dev --workspace=frontend
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- API Docs: http://localhost:5000/api-docs

---

## Docker Deployment

```bash
# Build and run all services (MySQL + Backend + Frontend)
docker-compose up --build
```

- Frontend: http://localhost
- Backend API: http://localhost:5000

---

## API Documentation

Interactive Swagger docs are available at `/api-docs` when the server is running.

### Key Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/auth/login` | POST | No | Login with email or Employee ID |
| `/api/auth/register` | POST | No | Register new user |
| `/api/employees` | GET | Admin | List all employees |
| `/api/attendance/check-in` | POST | Yes | Employee check-in |
| `/api/attendance/check-out` | POST | Yes | Employee check-out |
| `/api/leaves/apply` | POST | Yes | Apply for leave |
| `/api/leaves/admin/requests` | GET | Admin | View all leave requests |
| `/api/tasks` | GET | Yes | Task list (Admin/Manager all, Employee own) |
| `/api/departments` | GET | Yes | Department list |
| `/api/office-settings` | GET | Yes | Office geofence settings |

---

## Testing

```bash
# Backend tests with coverage
npm run test --workspace=backend

# Watch mode
npm run test:watch --workspace=backend
```

---

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Run both frontend & backend in dev mode |
| `npm run build` | Build production frontend |
| `npm run start` | Start production backend |
| `npm run test` | Run all tests |
| `npm run lint` | Lint all code |

---

## Security

- **Helmet.js** — Security headers (CSP, HSTS, X-Frame-Options, etc.)
- **Rate Limiting** — 100 req/15min general, 10 req/15min auth endpoints
- **CORS** — Configurable origin whitelist
- **bcryptjs** — Password hashing with salt rounds
- **JWT** — Stateless authentication with 7-day expiry
- **Input Validation** — express-validator on all routes
- **SQL Injection Protection** — Parameterized queries via MySQL2

---

## License

MIT © Softspire
