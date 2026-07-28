# BOOKMYCOOK - Phase 3: Booking System

## Overview
Implementation of a complete booking system with request/confirm flow, time slot availability, and status management.

## Tech Stack
| Component | Technology |
|-----------|------------|
| Frontend | React.js + Tailwind CSS 4 |
| Backend | Python Flask + SQLAlchemy |
| Database | SQLite (dev) / PostgreSQL (prod) |
| Booking Flow | Request & Confirm |
| Availability | Time Slots |

---

## Phase 3 Tasks - COMPLETED

### 1. Backend - Booking Model
- [x] Create Booking model (SQLAlchemy)
- [x] Add status management with transitions
- [x] Add relationships (Service, User, City, Area)
- [x] Implement JSON serialization

### 2. Backend - Availability Model
- [x] Create Availability model
- [x] Add time slot management
- [x] Implement overlap detection

### 3. Backend - Booking Routes
- [x] GET /api/bookings - List bookings (role-filtered)
- [x] GET /api/bookings/:id - Get booking details
- [x] POST /api/bookings - Create booking
- [x] PUT /api/bookings/:id/confirm - Confirm booking
- [x] PUT /api/bookings/:id/reject - Reject booking
- [x] PUT /api/bookings/:id/cancel - Cancel booking
- [x] GET /api/bookings/service/:id - Get service bookings

### 4. Backend - Availability Routes
- [x] GET /api/availability/:service_id - Get availability
- [x] POST /api/availability/:service_id - Set availability
- [x] DELETE /api/availability/:service_id/:slot_id - Remove slot
- [x] GET /api/availability/:service_id/available - Get available slots
- [x] GET /api/availability/:service_id/calendar - Get calendar view
- [x] GET /api/availability/slots - Get time slot templates

### 5. Frontend - Booking Components
- [x] BookingStatusBadge.jsx - Status indicator
- [x] BookingCard.jsx - Booking summary display
- [x] BookingList.jsx - List with status filters
- [x] TimeSlotPicker.jsx - Time slot selection
- [x] BookingForm.jsx - Create booking form

### 6. Frontend - Booking Pages
- [x] Bookings.jsx - Customer/Provider booking list
- [x] BookingDetail.jsx - Booking details with actions
- [x] CreateBooking.jsx - Booking creation flow

---

## Database Schema

### Bookings Table
```python
class Booking(db.Model):
    __tablename__ = 'bookings'
    
    id = db.Column(db.Integer, primary_key=True)
    service_id = db.Column(db.Integer, db.ForeignKey('services.id'))
    customer_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    provider_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    
    # Event Details
    event_date = db.Column(db.Date, nullable=False)
    event_time = db.Column(db.Time, nullable=False)
    event_type = db.Column(db.String(100))
    event_address = db.Column(db.Text)
    city_id = db.Column(db.Integer, db.ForeignKey('cities.id'))
    area_id = db.Column(db.Integer, db.ForeignKey('areas.id'))
    number_of_guests = db.Column(db.Integer)
    special_requirements = db.Column(db.Text)
    
    # Pricing
    base_amount = db.Column(db.Float)
    extra_charges = db.Column(db.Float, default=0.0)
    total_amount = db.Column(db.Float)
    
    # Status
    status = db.Column(db.String(20), default='pending')
    rejection_reason = db.Column(db.Text)
    cancelled_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    cancellation_reason = db.Column(db.Text)
```

### Availability Table
```python
class Availability(db.Model):
    __tablename__ = 'availability'
    
    id = db.Column(db.Integer, primary_key=True)
    service_id = db.Column(db.Integer, db.ForeignKey('services.id'))
    date = db.Column(db.Date, nullable=False)
    start_time = db.Column(db.Time, nullable=False)
    end_time = db.Column(db.Time, nullable=False)
    is_available = db.Column(db.Boolean, default=True)
    booking_id = db.Column(db.Integer, db.ForeignKey('bookings.id'))
    notes = db.Column(db.Text)
```

---

## Booking Status Flow

```
PENDING → CONFIRMED → PAYMENT_PENDING → PAID → COMPLETED
   │         │              │              │
   │         │              │              └→ CANCELLED
   │         │              └──────────────────→ CANCELLED
   │         └─────────────────────────────────→ CANCELLED
   └───────────────────────────────────────────→ REJECTED
```

### Status Definitions
| Status | Description |
|--------|-------------|
| pending | Initial booking request, awaiting provider confirmation |
| confirmed | Provider accepted, awaiting payment |
| rejected | Provider declined the booking |
| payment_pending | Ready for payment processing |
| paid | Payment completed |
| completed | Event successfully completed |
| cancelled | Booking cancelled by either party |

---

## API Endpoints

### Bookings
```
GET    /api/bookings                    - List user's bookings
GET    /api/bookings/:id                - Get booking details
POST   /api/bookings                    - Create new booking
PUT    /api/bookings/:id/confirm        - Confirm booking (provider)
PUT    /api/bookings/:id/reject         - Reject booking (provider)
PUT    /api/bookings/:id/cancel         - Cancel booking
GET    /api/bookings/service/:id        - Get service bookings
```

### Availability
```
GET    /api/availability/slots                  - Get time slot templates
GET    /api/availability/:service_id            - Get availability
POST   /api/availability/:service_id            - Set availability
DELETE /api/availability/:service_id/:slot_id  - Remove time slot
GET    /api/availability/:service_id/available   - Get available slots for date
GET    /api/availability/:service_id/calendar   - Get calendar view
```

---

## Time Slots

| ID | Label | Time |
|----|-------|------|
| 1 | Morning | 6:00 AM - 10:00 AM |
| 2 | Mid-Morning | 10:00 AM - 2:00 PM |
| 3 | Afternoon | 2:00 PM - 6:00 PM |
| 4 | Evening | 6:00 PM - 10:00 PM |
| 5 | Full Day | 6:00 AM - 10:00 PM |

---

## File Structure

```
BOOKMYCOOK/
├── server/
│   └── app/
│       ├── models/
│       │   ├── booking.py        # NEW
│       │   └── availability.py   # NEW
│       └── routes/
│           ├── bookings.py       # NEW
│           └── availability.py   # NEW
│
├── client/src/
│   ├── components/
│   │   └── bookings/             # NEW
│   │       ├── BookingStatusBadge.jsx
│   │       ├── BookingCard.jsx
│   │       ├── BookingList.jsx
│   │       ├── TimeSlotPicker.jsx
│   │       └── BookingForm.jsx
│   └── pages/
│       ├── Bookings.jsx          # NEW
│       ├── BookingDetail.jsx     # NEW
│       └── CreateBooking.jsx     # NEW
│
└── phase3.md
```

---

## Frontend Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/bookings` | Bookings.jsx | List all bookings |
| `/bookings/:id` | BookingDetail.jsx | Booking details |
| `/services/:id/book` | CreateBooking.jsx | Create booking |

---

## Test Results

### API Tests (All Passing)
```bash
# Create booking
POST /api/bookings → 201 Created
{
  "id": 1,
  "status": "pending",
  "event_date": "2026-04-15",
  "total_amount": 15000.0
}

# Confirm booking (provider)
PUT /api/bookings/1/confirm → 200 OK
{
  "status": "confirmed"
}

# Get bookings
GET /api/bookings → 200 OK
{
  "bookings": [...],
  "total": 1
}
```

### Test Data
- **Customer**: test@example.com
- **Provider**: chef@example.com (chef role)
- **Service**: Professional Chettinad Chef (₹15,000)
- **Booking**: Wedding, April 15, 2026, 100 guests

---

## Features Implemented

### Booking Creation
- Service selection
- Date picker (no past dates)
- Time slot selection
- Event type selection
- Guest count validation
- Event address input
- Special requirements
- Price calculation

### Booking Management
- Status-based filtering
- Provider confirm/reject actions
- Customer cancel option
- Booking detail view
- Provider/Customer info display

### Availability System
- Time slot templates
- Custom availability setting
- Calendar view
- Available slots API

---

## Pending (Future Phases)

### Email Notifications
- [ ] Booking created notification
- [ ] Booking confirmed notification
- [ ] Booking rejected notification
- [ ] Booking cancelled notification
- [ ] Payment reminder

### Payment Integration (Phase 4)
- [ ] Razorpay order creation
- [ ] Payment verification
- [ ] Invoice generation

### Reviews (Phase 5)
- [ ] Review submission
- [ ] Rating calculation
- [ ] Review display

---

## Running the Application

### Backend
```bash
cd server
uv run python run.py
```

### Frontend
```bash
cd client
npm run dev
```

### URLs
- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- Bookings: http://localhost:5173/bookings

---

## Phase 3 Status: COMPLETE

**Implementation Time**: ~2 hours
**Files Created**: 10+
**API Endpoints**: 12
**Frontend Components**: 5
**Frontend Pages**: 3
**Database Tables**: 2 new (bookings, availability)
