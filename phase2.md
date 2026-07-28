# BOOKMYCOOK - Phase 2: Service Management

## Overview
Implementation of Chef Services with CRUD operations, image uploads, and cuisine-based filtering for Tamil Nadu region.

## Tech Stack
| Component | Technology |
|-----------|------------|
| Frontend | React.js + Tailwind CSS 4 |
| Backend | Python Flask + SQLAlchemy |
| Database | SQLite (dev) / PostgreSQL (prod) |
| Image Storage | Local filesystem (server/uploads/) |
| Package Manager | uv (Python), npm (Node.js) |
| Service Type | Chef Services |

---

## Phase 2 Tasks - COMPLETED

### 1. Backend - Service Model
- [x] Create Service model (SQLAlchemy)
- [x] Add chef-specific fields (cuisine_types, event_types)
- [x] Implement JSON serialization for arrays
- [x] Add relationships (User, City, Area)

### 2. Backend - Service Routes
- [x] GET /api/services - List all services with filters
- [x] GET /api/services/:id - Get service details
- [x] POST /api/services - Create new service
- [x] PUT /api/services/:id - Update service
- [x] DELETE /api/services/:id - Delete service
- [x] GET /api/services/my - Get user's services

### 3. Backend - Image Upload
- [x] POST /api/upload/image - Single image upload
- [x] File validation (type, size - max 5MB)
- [x] Local storage in uploads/services/
- [x] Serve static files via Flask

### 4. Frontend - Service Components
- [x] ServiceCard.jsx - Display chef listing
- [x] ServiceList.jsx - Grid of services with loading states
- [x] ServiceFilters.jsx - Cuisine and location filters
- [x] ServiceForm.jsx - Create/edit form
- [x] Select.jsx - Dropdown component
- [x] FileUpload.jsx - Image upload with preview

### 5. Frontend - Service Pages
- [x] Services.jsx - Browse all chefs with pagination
- [x] ServiceDetail.jsx - Chef profile page
- [x] CreateService.jsx - Provider create form
- [x] EditService.jsx - Provider edit form

---

## Database Schema - Services

```python
class Service(db.Model):
    __tablename__ = 'services'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    service_type = db.Column(db.String(20), default='chef')
    
    # Chef-specific
    cuisine_types = db.Column(db.Text)  # JSON array
    event_types = db.Column(db.Text)    # JSON array
    experience_years = db.Column(db.Integer, default=0)
    
    # Pricing
    price_per_event = db.Column(db.Float)
    price_unit = db.Column(db.String(50), default='per_event')
    
    # Food preferences
    serves_veg = db.Column(db.Boolean, default=True)
    serves_non_veg = db.Column(db.Boolean, default=False)
    
    # Capacity
    min_guests = db.Column(db.Integer, default=10)
    max_guests = db.Column(db.Integer, default=500)
    
    # Location
    city_id = db.Column(db.Integer, db.ForeignKey('cities.id'))
    area_id = db.Column(db.Integer, db.ForeignKey('areas.id'))
    
    # Media
    images = db.Column(db.Text)  # JSON array of URLs
    
    # Status
    is_active = db.Column(db.Boolean, default=True)
    is_verified = db.Column(db.Boolean, default=False)
    rating = db.Column(db.Float, default=0.0)
    total_reviews = db.Column(db.Integer, default=0)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, onupdate=datetime.utcnow)
```

---

## API Endpoints

### Services
```
GET    /api/services                    - List all services (paginated)
GET    /api/services?type=chef          - Filter by service type
GET    /api/services?city=1             - Filter by city
GET    /api/services?cuisine=Chettinad  - Filter by cuisine
GET    /api/services?q=keyword          - Search by keyword
GET    /api/services/:id                - Get service details
POST   /api/services                    - Create service (provider only)
PUT    /api/services/:id                - Update service (owner only)
DELETE /api/services/:id                - Delete service (owner only)
GET    /api/services/my                 - Get current user's services
```

### Upload
```
POST   /api/upload/image                - Upload single image (max 5MB)
GET    /uploads/services/:filename       - Serve uploaded image
```

---

## Cuisine Types (Tamil Nadu)

| Cuisine | Description |
|---------|-------------|
| Chettinad | Spicy, aromatic cuisine from Chettinad region |
| Kongu | Traditional cuisine from Coimbatore region |
| Tamil Brahmin | Vegetarian cuisine with distinct flavors |
| Madurai | Famous for its unique non-veg dishes |
| Nanjil | Cuisine from Kanyakumari district |
| Multi-cuisine | Mix of various cuisines |
| North Indian | Popular North Indian dishes |
| Chinese | Indo-Chinese fusion |
| Continental | European-style dishes |

---

## File Structure

```
BOOKMYCOOK/
├── client/
│   └── src/
│       ├── components/
│       │   ├── services/
│       │   │   ├── ServiceCard.jsx
│       │   │   ├── ServiceList.jsx
│       │   │   ├── ServiceFilters.jsx
│       │   │   └── ServiceForm.jsx
│       │   └── common/
│       │       ├── Button.jsx
│       │       ├── Card.jsx
│       │       ├── Input.jsx
│       │       ├── Navbar.jsx
│       │       ├── Select.jsx
│       │       └── FileUpload.jsx
│       ├── pages/
│       │   ├── Home.jsx
│       │   ├── Login.jsx
│       │   ├── Register.jsx
│       │   ├── Profile.jsx
│       │   ├── Services.jsx
│       │   ├── ServiceDetail.jsx
│       │   ├── CreateService.jsx
│       │   └── EditService.jsx
│       ├── context/
│       │   └── AuthContext.jsx
│       ├── services/
│       │   └── api.js
│       └── utils/
│           └── constants.js
│
├── server/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── config.py
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── location.py
│   │   │   └── service.py
│   │   ├── routes/
│   │   │   ├── __init__.py
│   │   │   ├── auth.py
│   │   │   ├── users.py
│   │   │   ├── locations.py
│   │   │   ├── services.py
│   │   │   └── upload.py
│   │   └── utils/
│   │       ├── __init__.py
│   │       └── seed_data.py
│   ├── uploads/
│   │   └── services/
│   ├── pyproject.toml
│   ├── .python-version
│   ├── .env
│   ├── run.py
│   └── init_db.py
│
├── database/
│   ├── schema.sql
│   └── seeds/
│       └── tamilnadu_cities.sql
│
├── phase1.md
├── phase2.md
├── README.md
└── setup_database.sh
```

---

## Features Implemented

### Service Listing Page
- Grid display of chef services
- Image gallery with thumbnails
- Rating and review count display
- Cuisine type badges
- Location and pricing info
- Pagination support (12 per page)
- Loading skeleton states

### Search & Filter
- Filter by city (40 Tamil Nadu cities)
- Filter by area (42 areas in major cities)
- Filter by cuisine type (9 options)
- Filter by event type (8 options)
- Search by keyword

### Service Creation Form
- Multi-section form layout
- Cuisine type multi-select
- Event type multi-select
- Image upload (up to 5 images)
- Guest capacity settings (min/max)
- Food preference toggles (Veg/Non-veg)
- Location selection (city/area)
- Price per event input

### Service Detail Page
- Full image gallery with thumbnails
- Provider information card
- Cuisine and event type badges
- Food preferences display
- Guest capacity info
- Book now button
- Edit/Delete options for owners

---

## Test Results

### API Tests (All Passing)
```bash
# Health check
GET /api/health → {"status": "healthy"}

# User registration (chef role)
POST /api/auth/register → 201 Created

# Service creation
POST /api/services → 201 Created

# Service listing
GET /api/services → 200 OK (1 service)

# Cuisine filter
GET /api/services?cuisine=Chettinad → 200 OK (1 service)

# City filter
GET /api/services?city=1 → 200 OK (Chennai services)
```

### Test Data
- **User**: chef@example.com (role: chef)
- **Service**: "Professional Chettinad Chef"
  - Cuisines: Chettinad, Tamil Brahmin
  - Events: Wedding, Engagement, Housewarming
  - Price: ₹15,000 per event
  - Location: Chennai
  - Capacity: 50-500 guests

---

## Frontend Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/services` | Services.jsx | Browse all chefs with filters |
| `/services/new` | CreateService.jsx | Create new chef listing |
| `/services/:id` | ServiceDetail.jsx | View chef details |
| `/services/:id/edit` | EditService.jsx | Edit chef listing |

---

## Next Steps (Phase 3)

### 1. Booking System
- [ ] Booking creation flow
- [ ] Availability calendar
- [ ] Booking status tracking
- [ ] Booking history page

### 2. Payment Integration (Razorpay)
- [ ] Razorpay order creation
- [ ] Payment verification
- [ ] Invoice generation
- [ ] Refund handling

### 3. Reviews & Ratings
- [ ] Review submission form
- [ ] Rating calculation
- [ ] Review display on service page
- [ ] Review moderation (admin)

---

## Running the Application

### Backend
```bash
cd server
uv venv && source .venv/bin/activate
uv pip sync
uv run python init_db.py  # Initialize database
uv run python run.py      # Start server
```

### Frontend
```bash
cd client
npm install
npm run dev
```

### URLs
- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- API Health: http://localhost:5000/api/health

---

## Phase 2 Status: COMPLETE

**Implementation Time**: ~2 hours
**Files Created**: 15+
**API Endpoints**: 8
**Frontend Components**: 10
**Database Tables**: 1 new (services)
