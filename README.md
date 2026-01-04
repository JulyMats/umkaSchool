# UmkaSchool

E-learning platform for teaching mental arithmetic to children using Soroban (Japanese abacus) methodology.

## 📋 Overview

UmkaSchool is a full-stack web application designed to help children learn mental arithmetic through interactive exercises, daily challenges, homework assignments, and gamification features. The platform supports multiple user roles (Students, Teachers, Admins) and provides progress tracking and achievements.

## 🛠️ Tech Stack

### Backend
- **Java 21** (LTS)
- **Spring Boot 3.5.6**
- **PostgreSQL** (production database)
- **Spring Data JPA / Hibernate**
- **Spring Security** (JWT authentication)
- **Maven** (build tool)
- **Testcontainers** (for integration tests with PostgreSQL)

### Frontend
- **React 18** with TypeScript
- **Vite** (build tool)
- **Tailwind CSS** (styling)
- **React Router** (routing)
- **Axios** (HTTP client)

## 📋 Prerequisites

- **Java 21**
- **Maven 3.6+** (or use Maven Wrapper: `./mvnw` / `.\mvnw.cmd`)
- **PostgreSQL 15+** (for local development)
- **Docker Desktop** (required for running tests with Testcontainers)
- **Node.js 18+** and **npm** (for frontend)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd umkaSchool
```

### 2. Database Setup

#### Production/Development Database

1. Create a PostgreSQL database:
```sql
CREATE DATABASE umkaSchoolDB;
CREATE SCHEMA school;
```

2. Initialize the schema:
```bash
psql -U postgres -d umkaSchoolDB -f src/main/resources/db/schema.sql
```

### 3. Backend Configuration

The application uses environment variables for sensitive configuration. Copy the example environment file and configure it:

1. Copy `.env.local.example` to `.env`:
```bash
# Windows
copy .env.local.example .env

# Linux/Mac
cp .env.local.example .env
```

2. Edit the `.env` file with your configuration:
```env
# ============================================
# Database Configuration
# ============================================
DB_URL=jdbc:postgresql://localhost:5432/umkaSchoolDB
DB_USERNAME=postgres
DB_PASSWORD=your-database-password

# ============================================
# Server Configuration
# ============================================
SERVER_PORT=8080
...
```

### 4. Run the Backend

```bash
# Using Maven Wrapper (Windows)
.\mvnw.cmd spring-boot:run

# Using Maven Wrapper (Linux/Mac)
./mvnw spring-boot:run

# Or using Maven directly
mvn spring-boot:run
```

The backend will start on `http://localhost:8080` (or the port specified in `SERVER_PORT`).

### 5. Run the Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will start on `http://localhost:5173` (or the port shown in the terminal).

## 🧪 Running Tests

### Prerequisites for Tests

- **Docker Desktop must be running** (required for Testcontainers)

### Run All Tests

```bash
# Windows
.\mvnw.cmd test

# Linux/Mac
./mvnw test
```

### Run Specific Test Class

```bash
.\mvnw.cmd test -Dtest=AuthControllerTest
```

### Run Specific Test Method

```bash
.\mvnw.cmd test -Dtest=AuthControllerTest#testSignup_Success
```

## 🔐 Security

- JWT-based authentication
- Role-based authorization (STUDENT, TEACHER, ADMIN)
- Password encryption with BCrypt
- Rate limiting (configurable per endpoint)
- CORS configuration

## 📝 API Documentation

The backend provides RESTful APIs. Main endpoints:

- `/api/auth/*` - Authentication (signup, signin, password reset)
- `/api/students/*` - Student management
- `/api/teachers/*` - Teacher management
- `/api/exercises/*` - Exercise management
- `/api/homework/*` - Homework management
- `/api/groups/*` - Group management
- `/api/progress/*` - Progress tracking
- `/api/achievements/*` - Achievements

## 🐛 Troubleshooting

### Tests Fail with "Could not find a valid Docker environment"
- Ensure Docker Desktop is running
- Verify Docker is accessible: `docker ps`

### Database Connection Issues
- Check PostgreSQL is running
- Verify connection settings in `application.properties`
- Ensure database and schema exist
