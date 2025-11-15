# Talent Acquisition System (TAS)

A modern talent acquisition system built with Angular, Tailwind CSS, and Spring Boot.

## Features

- **User-Friendly Interface**: Clean, responsive design with Tailwind CSS
- **Secure Login**: JWT-based authentication system
- **Applicant Dashboard**: View and apply to job postings
- **Job Posting**: HR can create and manage job listings
- **Role-based Access**: Different interfaces for applicants, HR, and admins

## Tech Stack

### Backend
- Spring Boot 3.2.0
- Spring Security with JWT
- Spring Data JPA
- MySQL Database
- Maven

### Frontend
- Angular 19
- Tailwind CSS
- TypeScript
- RxJS

## Getting Started

### Prerequisites
- Java 17+
- Node.js 18+
- Maven
- MySQL 8.0+

### Backend Setup
1. Install and start MySQL server
2. Create database (optional - auto-created):
   ```sql
   CREATE DATABASE tasdb;
   ```
3. Update database credentials in `application.yml` if needed
4. Navigate to the backend directory:
   ```bash
   cd backend
   ```
5. Run the Spring Boot application:
   ```bash
   mvn spring-boot:run
   ```

The backend will start on `http://localhost:8080`

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

The frontend will start on `http://localhost:4200`

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Jobs
- `GET /api/jobs/public` - Get all active jobs
- `GET /api/jobs/{id}` - Get job by ID
- `POST /api/jobs` - Create new job (authenticated)
- `PUT /api/jobs/{id}` - Update job (authenticated)
- `DELETE /api/jobs/{id}` - Delete job (authenticated)

## Getting Started

The system starts with a clean database. You need to register users through the registration interface.

## Project Structure

```
TAS/
├── backend/
│   ├── src/main/java/com/tas/
│   │   ├── entity/          # JPA entities
│   │   ├── repository/      # Data repositories
│   │   ├── service/         # Business logic
│   │   ├── controller/      # REST controllers
│   │   ├── config/          # Configuration classes
│   │   └── dto/             # Data transfer objects
│   └── pom.xml
└── frontend/
    ├── src/app/
    │   ├── components/      # Angular components
    │   ├── services/        # Angular services
    │   ├── models/          # TypeScript interfaces
    │   └── app.routes.ts    # Routing configuration
    ├── package.json
    └── tailwind.config.js
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request