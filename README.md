# Soppadop App

Full-stack application with Flask backend API and Vue.js frontend.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Flask 3.0, SQLAlchemy 2.0, JWT Auth, RBAC |
| Database | MySQL 8.0 |
| Frontend | Vue.js + Vite |
| Container | Docker, Docker Compose |

## Prerequisites

- Docker & Docker Compose
- Python 3.12+ (chạy local dev)
- Node.js 18+ (chạy local dev)

## Cách chạy dự án

### Option 1: Docker Compose (Khuyến nghị - chạy cả hệ thống)

```bash
# 1. Clone project
git clone <repo-url>
cd soppadop-app-py

# 2. Tạo file env cho production
# Tạo file deployment/.env với nội dung sau:

SECRET_KEY=your-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-key-here
DB_ROOT_PASSWORD=password
DB_NAME=soppadop_db
DB_USER=soppadop
DB_PASSWORD=password
SUPER_ADMIN_EMAIL=owner@soppadop.com
SUPER_ADMIN_USERNAME=owner
SUPER_ADMIN_PASSWORD=SuperAdmin@123

# 3. Build và chạy tất cả services
cd deployment
docker compose up -d --build

# 4. Xem logs
docker compose logs -f

# 5. Dừng services
docker compose down
```

Sau khi chạy xong:
- Backend: `http://localhost:5000`
- Frontend: `http://localhost:80`
- API Docs: `http://localhost:5000/api/docs`

### Option 2: Chạy từng phần (Development)

#### Bước 1: Start Database

```bash
cd deployment
docker compose -f docker-compose.dev.yml up -d
```

MySQL chạy trên `localhost:3307`, database `soppadop_db`, root password `password`.

#### Bước 2: Start Backend (Local)

```bash
cd backend-api

# Tạo virtual environment
python -m venv .venv

# Windows
.venv\Scripts\activate
pip install -r requirements.txt

# Linux/Mac
source .venv/bin/activate
pip install -r requirements.txt

# Cấu hình env
cp .env.example .env
# Edit .env, set SECRET_KEY và JWT_SECRET_KEY

# Chạy backend
python wsgi.py
```

Backend chạy tại `http://localhost:5000`.

#### Bước 3: Start Frontend (Local)

```bash
cd frontend
npm install
npm run dev
```

Frontend chạy tại `http://localhost:5173`.

#### Dừng Database

```bash
cd deployment
docker compose -f docker-compose.dev.yml down
```

### Option 3: Dùng Make (nếu đã cài Make)

```bash
make dev            # Start dev database (Docker)
make backend-dev    # Start backend (local)
make frontend-dev   # Start frontend (local)
make dev-down       # Stop dev database

make up             # Start all services (production Docker)
make down           # Stop all services
make restart        # Restart all services
make logs           # Show logs
make help           # Show all commands
```

## Environment Variables

File `.env` trong `backend-api/`:

```env
# Flask
FLASK_ENV=development
FLASK_DEBUG=true

# Secret keys (bắt buộc, tạo bằng: python -c "import secrets; print(secrets.token_hex(32))")
SECRET_KEY=your-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-key-here

# Database
DATABASE_URL=mysql+pymysql://root:password@localhost:3307/soppadop_db

# CORS
CORS_ORIGINS=http://localhost:5173

# Logging
LOG_LEVEL=DEBUG

# Super Admin account (seed lần đầu)
SUPER_ADMIN_EMAIL=owner@soppadop.com
SUPER_ADMIN_USERNAME=owner
SUPER_ADMIN_PASSWORD=SuperAdmin@123
```

File `deployment/.env` (cho Docker Compose production):

```env
SECRET_KEY=your-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-key-here
DB_ROOT_PASSWORD=password
DB_NAME=soppadop_db
DB_USER=soppadop
DB_PASSWORD=password
SUPER_ADMIN_EMAIL=owner@soppadop.com
SUPER_ADMIN_USERNAME=owner
SUPER_ADMIN_PASSWORD=SuperAdmin@123
```

## API Documentation

Swagger UI: `http://localhost:5000/api/docs`

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Đăng ký | Không |
| POST | `/api/auth/login` | Đăng nhập | Không |
| POST | `/api/auth/refresh` | Refresh token | Refresh token |
| GET | `/api/auth/me` | Lấy thông tin user hiện tại | Bearer token |
| POST | `/api/auth/logout` | Đăng xuất (thu hồi token) | Bearer token |
| PUT | `/api/auth/users/:id` | Cập nhật user | Bearer token |
| DELETE | `/api/auth/users/:id` | Xóa user | Admin |

### Roles & Permissions

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/roles` | Danh sách roles | `roles.view` |
| GET | `/api/roles/:id` | Chi tiết role | `roles.view` |
| POST | `/api/roles` | Tạo role | `roles.create` |
| PUT | `/api/roles/:id` | Cập nhật role | `roles.update` |
| DELETE | `/api/roles/:id` | Xóa role | `roles.delete` |
| GET | `/api/permissions` | Danh sách permissions | `permissions.view` |
| PUT | `/api/roles/:id/permissions` | Gán permissions cho role | `permissions.assign` |
| POST | `/api/roles/:id/permissions/:pid` | Thêm permission | `permissions.assign` |
| DELETE | `/api/roles/:id/permissions/:pid` | Gỡ permission | `permissions.assign` |

### Health

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/health` | Health check | Không |
| GET | `/api/health/ready` | Readiness check | Không |

## Default Roles

| Role | Description |
|------|-------------|
| `super_admin` | Chủ sở hữu - quyền cao nhất, tài khoản duy nhất |
| `admin` | Quản trị viên - toàn quyền hệ thống |
| `manager` | Quản lý - quản lý users, xem roles |
| `client` | Khách hàng - quyền cơ bản |

## Project Structure

```
soppadop-app-py/
├── backend-api/                 # Flask API
│   ├── src/
│   │   ├── app.py               # App factory
│   │   ├── config.py            # Config (Dev/Prod/Test)
│   │   ├── api/
│   │   │   ├── controllers/     # Route handlers
│   │   │   │   ├── auth_controller.py
│   │   │   │   └── role_controller.py
│   │   │   ├── models/          # SQLAlchemy models
│   │   │   │   ├── user.py
│   │   │   │   └── role.py
│   │   │   ├── services/        # Business logic
│   │   │   ├── repositories/    # Database operations
│   │   │   ├── schemas/         # Request validation
│   │   │   ├── utils/
│   │   │   │   ├── decorators.py    # @admin_required, @permission_required
│   │   │   │   ├── exceptions.py    # Error handlers
│   │   │   │   └── logger.py        # Logging
│   │   │   ├── routes/
│   │   │   │   └── health.py        # Health check
│   │   │   ├── seeds/
│   │   │   │   └── role_seed.py     # Default data
│   │   │   ├── docs/                # Swagger/OpenAPI
│   │   │   └── extensions.py        # JWT blocklist, rate limiter
│   │   └── logs/                    # Log files
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── .env
│   └── wsgi.py
├── frontend/                    # Vue.js app
├── deployment/
│   ├── docker-compose.yml       # Production
│   └── docker-compose.dev.yml   # Dev (MySQL only)
├── Makefile
└── README.md
```
