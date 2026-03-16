# ⚡ Skill Connect — Local Service Discovery & Booking Platform

A full-stack web application connecting customers with nearby skilled workers (plumbers, electricians, carpenters, tutors, etc.)

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js, React Router, i18next, Axios, Leaflet |
| Backend | Node.js, Express.js, REST API |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |
| Payments | UPI QR / Deep Link (no SDK) |
| File Upload | Cloudinary |
| Email | Nodemailer (Gmail) |
| Maps | Leaflet + OpenStreetMap (free, no API key) |
| PWA | Service Worker + manifest.json |

---

## 📁 Project Structure

```
skillworker-platform/
├── backend/
│   ├── config/          → DB & Cloudinary config
│   ├── controllers/     → Business logic
│   ├── middleware/      → JWT auth guard
│   ├── models/          → MongoDB schemas
│   ├── routes/          → API endpoints
│   ├── services/        → Email, SMS, OTP, Voice
│   ├── .env             → Environment variables
│   └── server.js        → Express entry point
└── frontend/
    ├── public/          → PWA assets, manifest, service worker
    └── src/
        ├── api/         → Axios instance
        ├── components/  → Reusable UI components
        ├── context/     → Auth state
        ├── i18n/        → English & Telugu translations
        └── pages/       → All page components
```

---

## ⚙️ Setup Instructions

### 1. Clone & Install

```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install --legacy-peer-deps
```

### 2. Configure Environment Variables

Edit `backend/.env`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/skillworker
JWT_SECRET=skillconnect_secret_2024
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLIENT_URL=http://localhost:3000
UPI_ID=yourname@upi
UPI_NAME=Skill Connect
PAYMENT_LINK=http://localhost:3000/pay
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
```

### 3. Seed Database

```bash
cd backend
npm run seed
```

### 4. Run

```bash
# Backend (port 5000)
cd backend && npm run dev

# Frontend (port 3000)
cd frontend && npm start
```

---

## 🔐 Demo Credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@skillworker.com | admin123 |
| Worker | worker@test.com | test123 |
| Customer | customer@test.com | test123 |

---

## ✅ Features Implemented

### Authentication
- JWT-based login/register
- Role-based access (Customer / Worker / Admin)
- OTP phone verification on register
- Password hashing with bcryptjs
- Rate limiting (100 req/15min, 20 auth/15min)

### Worker System
- Worker profile with skills, experience, hourly rate
- ID proof upload via Cloudinary
- Availability schedule (days + time)
- Admin verification system
- Availability toggle on dashboard

### Booking System
- Book worker with date, time, description
- Payment method selection (UPI / Online / Cash)
- Status flow: pending → accepted → in-progress → completed
- Cancel booking
- Rate & review after completion

### Payment System
- UPI deep link (Google Pay, PhonePe, Paytm)
- QR code auto-generated from UPI ID
- Screenshot upload for manual confirmation
- Cash after service option

### Location Features
- Leaflet map (free, no API key)
- Click map to pin service location
- Use My Location (browser geolocation)
- Nearby workers with map markers
- Map/List view toggle

### Notifications
- SMS notifications (console log, ready for Twilio)
- Email notifications via Nodemailer:
  - Welcome email on register
  - Booking confirmation
  - Payment receipt
  - New job alert to worker

### Language Support
- English + Telugu (తెలుగు)
- Language toggle in Navbar
- All dashboards, auth pages, booking flow translated

### Voice Guidance
- Telugu voice scripts via Web Speech API
- Voice guide on Worker Dashboard & Setup

### Smart Recommendations
- Workers sorted by: rating ↓, price ↑, bookings ↓
- Shown on Home page

### PWA
- manifest.json configured
- Service worker with offline support
- Installable on mobile

### Admin Dashboard
- Gradient stat cards
- User management (activate/suspend)
- Worker verification
- Live search
- Recent bookings table

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login |
| POST | /api/auth/send-otp | Send OTP |
| POST | /api/auth/verify-otp | Verify OTP |
| GET | /api/workers/search | Search workers |
| GET | /api/workers/nearby | GPS-based search |
| GET | /api/workers/recommended | Smart recommendations |
| POST | /api/bookings | Create booking |
| PUT | /api/bookings/:id/status | Update status |
| POST | /api/payments/confirm-manual | UPI screenshot upload |
| GET | /api/payments/config | UPI config |
| GET | /api/voice/:script | Telugu voice script |
| GET | /api/admin/dashboard | Admin stats |

---

## 📱 Pages

| URL | Page |
|---|---|
| / | Home |
| /search | Search Workers |
| /categories | All Categories |
| /nearby | Nearby Workers Map |
| /worker/:id | Worker Profile + Booking |
| /login | Login |
| /register | Register + OTP |
| /my-bookings | Customer Bookings |
| /worker/dashboard | Worker Dashboard |
| /worker/setup | Worker Profile Setup |
| /admin/dashboard | Admin Panel |
