# Clinic Booking System

A modern, responsive clinic booking website with geolocation-based search and real-time availability.

## Tech Stack

### Frontend
- **React** (Vite) - Modern React development
- **Mapbox GL JS** - Interactive maps and geocoding
- **TailwindCSS** - Utility-first styling
- **React Router** - Client-side routing
- **Axios** - HTTP client

### Backend
- **Node.js** + **Express** - Server framework
- **JWT** - Authentication
- **PostgreSQL** - Primary database
- **PostGIS** - Spatial queries (optional)

### External Services
- **Mapbox** - Maps, geocoding, directions
- **SendGrid** - Email service with PDF receipts
- **AWS S3** - File storage for receipts

## Project Structure

```
├── frontend/          # React Vite application
├── backend/           # Node.js Express API
├── database/          # Database schemas and migrations
├── docs/             # Documentation
└── README.md
```

## Pages & Features

1. **Landing Page** - Introduction with CTA
2. **Find Clinics** - Map-based search with filtering
3. **Clinic Details** - Full info and booking
4. **Reservation Flow** - Multi-step booking process
5. **My Appointments** - User appointment management
6. **Admin Dashboard** - Clinic and reservation management
7. **Static Pages** - About, Contact, Privacy, Terms

## User Flow

1. User grants location access or enters address
2. System displays nearby clinics on map + list
3. User filters by service type if needed
4. User selects clinic and views details
5. User chooses timeslot and fills reservation form
6. System confirms booking, sends email receipt
7. User can manage appointments via dashboard

## API Endpoints

- `GET /api/clinics?lat=..&lng=..&service=..` - Find nearby clinics
- `POST /api/appointments` - Create reservation
- `GET /api/appointments/:id` - Get appointment details
- `DELETE /api/appointments/:id` - Cancel appointment
- `POST /api/auth/login` - User authentication
- `GET /api/admin/clinics` - Admin clinic management

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Mapbox API token
- SendGrid API key
- AWS S3 credentials

### Installation
```bash
# Clone and setup
cd frontend && npm install
cd ../backend && npm install
```

### Environment Variables
Create `.env` files in both frontend and backend with required API keys and database URLs.

## Deployment

- **Frontend**: Vercel/Netlify
- **Backend**: Render/Heroku/AWS
- **Database**: Supabase/Amazon RDS
