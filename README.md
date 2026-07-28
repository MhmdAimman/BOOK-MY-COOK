# BOOKMYCOOK

Tamil Nadu's premier platform for booking chefs, catering services, and decoration management for events.

## Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | React.js + Tailwind CSS |
| Backend | Python Flask |
| Database | PostgreSQL |
| Payment | Razorpay |
| Region | Tamil Nadu, India |

## Project Structure

```
BOOKMYCOOK/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── context/        # React Context (auth)
│   │   ├── services/       # API service calls
│   │   ├── hooks/          # Custom hooks
│   │   └── utils/          # Helper functions
│   └── package.json
│
├── server/                 # Flask Backend
│   ├── app/
│   │   ├── models/         # SQLAlchemy models
│   │   ├── routes/         # API endpoints
│   │   └── utils/          # Helper functions
│   ├── pyproject.toml
│   └── run.py
│
├── database/               # SQL scripts
│   ├── schema.sql
│   └── seeds/
│
└── phase1.md              # Phase 1 documentation
```

## Setup Instructions

### Prerequisites

- Node.js 18+
- Python 3.10+
- PostgreSQL 14+
- uv (Python package manager)

### Install uv

```bash
# Linux/Mac
curl -LsSf https://astral.sh/uv/install.sh | sh

# Windows
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
```

### Database Setup

1. Create PostgreSQL database:
```bash
sudo -u postgres psql
CREATE DATABASE bookmycook;
CREATE USER bookmycook_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE bookmycook TO bookmycook_user;
```

2. Run schema and seed files:
```bash
psql -U bookmycook_user -d bookmycook -f database/schema.sql
psql -U bookmycook_user -d bookmycook -f database/seeds/tamilnadu_cities.sql
```

### Backend Setup (using uv)

1. Navigate to server directory:
```bash
cd server
```

2. Create virtual environment and install dependencies:
```bash
uv venv
source .venv/bin/activate  # Linux/Mac
# or
.venv\Scripts\activate     # Windows
```

3. Install dependencies:
```bash
uv pip sync
# or
uv pip install -e .
```

4. Configure environment variables in `server/.env`:
```
DATABASE_URL=postgresql://bookmycook_user:your_password@localhost:5432/bookmycook
SECRET_KEY=your-secret-key
JWT_SECRET_KEY=your-jwt-secret-key
```

5. Run database migrations:
```bash
uv run flask db init
uv run flask db migrate -m "Initial migration"
uv run flask db upgrade
```

6. Start the server:
```bash
uv run python run.py
```

Server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/password` - Update password

### Locations
- `GET /api/cities` - Get all Tamil Nadu cities
- `GET /api/cities/:id/areas` - Get areas by city

## User Roles

| Role | Description |
|------|-------------|
| Customer | Book services for events |
| Chef | Offer cooking services |
| Caterer | Offer catering services |
| Decorator | Offer decoration services |
| Admin | Platform management |

## Features

- User authentication with JWT
- Role-based access control
- Service listings for chefs, caterers, decorators
- Booking system
- Razorpay payment integration
- Reviews and ratings
- Real-time messaging
- Tamil Nadu cities and areas

## License

MIT License
