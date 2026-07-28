# BOOKMYCOOK - Phase 1: Project Setup & Foundation

## Overview
Initial project setup for Tamil Nadu-focused event services booking platform.

## Tech Stack
| Component | Technology |
|-----------|------------|
| Frontend | React.js + Tailwind CSS |
| Backend | Python Flask |
| Database | PostgreSQL |
| Payment | Razorpay |
| Region | Tamil Nadu, India |

---

## Phase 1 Tasks

### 1. Project Structure Setup
- [x] Create root directory structure
- [ ] Initialize React frontend with Vite
- [ ] Initialize Flask backend
- [ ] Configure PostgreSQL database

### 2. Frontend Setup (React + Tailwind)
- [ ] Create React app with Vite
- [ ] Install and configure Tailwind CSS
- [ ] Set up folder structure (components, pages, context, services)
- [ ] Configure routing (React Router)
- [ ] Set up React Context for auth state
- [ ] Create base layout components

### 3. Backend Setup (Flask)
- [ ] Initialize Flask application factory
- [ ] Configure SQLAlchemy with PostgreSQL
- [ ] Set up Flask-Migrate for migrations
- [ ] Configure JWT authentication
- [ ] Create base models
- [ ] Set up CORS for frontend communication

### 4. Database Setup (PostgreSQL)
- [ ] Create database `bookmycook`
- [ ] Design and create initial schema
- [ ] Set up migrations
- [ ] Seed Tamil Nadu cities and areas

### 5. Authentication System
- [ ] User registration (Customer, Chef, Caterer, Decorator)
- [ ] User login with JWT
- [ ] Password hashing (bcrypt)
- [ ] Role-based access control
- [ ] Profile management endpoints

---

## Database Schema - Phase 1

### Users Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(15),
    role VARCHAR(20) NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Profiles Table
```sql
CREATE TABLE profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    profile_image VARCHAR(255),
    bio TEXT,
    address TEXT,
    city_id INTEGER,
    area_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Cities Table (Tamil Nadu)
```sql
CREATE TABLE cities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    district VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Areas Table
```sql
CREATE TABLE areas (
    id SERIAL PRIMARY KEY,
    city_id INTEGER REFERENCES cities(id),
    name VARCHAR(100) NOT NULL,
    pincode VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## API Endpoints - Phase 1

### Authentication
```
POST   /api/auth/register     - Register new user
POST   /api/auth/login        - Login user
POST   /api/auth/logout       - Logout user
GET    /api/auth/me           - Get current user
POST   /api/auth/verify       - Verify email/phone
```

### User Profile
```
GET    /api/users/profile     - Get user profile
PUT    /api/users/profile     - Update user profile
```

### Locations
```
GET    /api/cities            - Get all Tamil Nadu cities
GET    /api/cities/:id/areas  - Get areas by city
```

---

## Folder Structure

```
BOOKMYCOOK/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Input.jsx
│   │   │   │   ├── Card.jsx
│   │   │   │   └── Navbar.jsx
│   │   │   └── layout/
│   │   │       ├── Header.jsx
│   │   │       ├── Footer.jsx
│   │   │       └── Layout.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── Profile.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── hooks/
│   │   │   └── useAuth.js
│   │   ├── utils/
│   │   │   └── constants.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── server/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── config.py
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── profile.py
│   │   │   └── location.py
│   │   ├── routes/
│   │   │   ├── __init__.py
│   │   │   ├── auth.py
│   │   │   ├── users.py
│   │   │   └── locations.py
│   │   └── utils/
│   │       ├── __init__.py
│   │       └── decorators.py
│   ├── migrations/
│   ├── requirements.txt
│   └── run.py
│
├── database/
│   ├── schema.sql
│   └── seeds/
│       └── tamilnadu_cities.sql
│
└── README.md
```

---

## Dependencies

### Frontend (package.json)
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.0.0",
    "axios": "^1.6.0"
  },
  "devDependencies": {
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0"
  }
}
```

### Backend (requirements.txt)
```
Flask==3.0.0
Flask-SQLAlchemy==3.1.0
Flask-Migrate==4.0.0
Flask-CORS==4.0.0
Flask-JWT-Extended==4.6.0
psycopg2-binary==2.9.9
bcrypt==4.1.0
python-dotenv==1.0.0
```

---

## Environment Variables

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
```

### Backend (.env)
```
FLASK_APP=run.py
FLASK_ENV=development
DATABASE_URL=postgresql://username:password@localhost:5432/bookmycook
JWT_SECRET_KEY=your-secret-key
```

---

## Deliverables
1. Working React frontend with Tailwind CSS
2. Flask backend with PostgreSQL connection
3. User registration and login system
4. JWT-based authentication
5. Basic profile management
6. Tamil Nadu cities seeded in database

---

## Estimated Time
- Frontend Setup: 2-3 hours
- Backend Setup: 2-3 hours
- Database Setup: 1-2 hours
- Authentication: 3-4 hours
- Testing: 2 hours

**Total: 10-14 hours**
