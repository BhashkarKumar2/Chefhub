# ChefHub — AI‑Enhanced Private Chef Booking

Connect with verified private chefs, explore menus, and book curated culinary experiences. ChefHub blends a modern UX with AI features, location awareness, and secure payments.

[![Node.js](https://img.shields.io/badge/Node.js-16+-green)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-blue)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-5.0+-green)](https://mongodb.com)
[![Razorpay](https://img.shields.io/badge/Payments-Razorpay-orange)](https://razorpay.com)
[![Gemini](https://img.shields.io/badge/AI-Google%20Gemini-orange)](https://ai.google.dev)

## Features

- AI recommendations, AI menu generation, and assistant tools
- Advanced search and filters with location awareness
- Realtime updates (bookings, notifications) via Socket.io
- Secure authentication (email/password, OAuth/OTP)
- Chef profiles, portfolios, certificates, galleries, reviews
- Secure payments with Razorpay Checkout
- Responsive UI with Tailwind and dark/light themes
- Toast notifications across the app (non‑blocking)

## Live

- Frontend: `https://chefhub-poou.vercel.app`
- Backend API: `https://chefhub.onrender.com`
- Health: `https://chefhub.onrender.com/api/health`

## Tech Stack

- Frontend: React 18, Vite, Tailwind CSS, React Router, Socket.io Client
- Backend: Node.js, Express, MongoDB (Mongoose), Socket.io, JWT, Multer
- AI/External: Google Gemini, Firebase, Cloudinary, Razorpay, OpenRouteService

## Monorepo Layout

```
./
├─ backend/
│  ├─ auth/                # auth controller, middleware, routes
│  ├─ config/              # cloudinary, passport, env loaders
│  ├─ controllers/         # booking, chef, payment, etc.
│  ├─ models/              # Booking, Chef, User
│  ├─ routes/              # api route modules
│  └─ server.js            # express entry
└─ frontend/
   └─ src/
      ├─ components/       # UI, booking flow, shared widgets
      ├─ pages/            # auth, chef, user, basic
      ├─ context/          # auth, theme
      ├─ utils/            # apiConfig, theme, etc.
      └─ App.jsx           # router
```

## Key UX Notes

- Canonical booking route is `/book-chef`. Navigating to `/chefs` redirects to `/book-chef`.
- On the booking page, “Book Now” buttons are disabled until the user sets a valid service location (geocoded lat/lon).
- Toasts (react-hot-toast) replace blocking alerts globally.

## Getting Started

### Prerequisites

- Node.js 16+
- MongoDB 5.0+
- Accounts/keys: Google Gemini, Firebase, Cloudinary, Razorpay, OpenRouteService

### Setup

1) Clone
```bash
git clone https://github.com/yourusername/chefhub.git
cd chefhub
```

2) Backend
```bash
cd backend
npm install
copy .env.example .env  # or manually create .env
# Fill .env with your secrets
```

3) Frontend
```bash
cd ../frontend
npm install
```

### Run (two terminals)

```bash
# Terminal 1
cd backend
npm start

# Terminal 2
cd frontend
npm run dev
```

## Environment Variables

### Backend `.env`

```bash
PORT=5000
NODE_ENV=development

# Mongo
MONGODB_URI=mongodb://localhost:27017/chefhub

# Auth
JWT_SECRET=your_jwt_secret

# Google Gemini
GEMINI_API_KEY=your_gemini_api_key

# Firebase (if used)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=service@acct.iam.gserviceaccount.com

# Google OAuth (optional)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# Cloudinary
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# Razorpay
RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...

# OpenRouteService
ORS_API_KEY=...

# Sessions
SESSION_SECRET=...
```

### Frontend `.env`

```bash
# Payments
VITE_RAZORPAY_KEY_ID=...

# OpenRouteService
VITE_ORS_API_KEY=...

# EmailJS (if used)
VITE_EMAILJS_SERVICE_ID=...
VITE_EMAILJS_TEMPLATE_ID=...
VITE_EMAILJS_PUBLIC_KEY=...
```

## API Overview

- Base: `https://chefhub.onrender.com/api`
- Auth: `/auth/register`, `/auth/login`, `/auth/verify-firebase-otp`
- Chefs: `/chefs`, `/chefs/search`, `/chefs/:id`
- Bookings: `/bookings` (POST), `/bookings/user/:id` (GET)
- Payments: `/payments/create-order`, `/payments/verify`
- AI: `/ai/chef-recommendations`, `/ai/generate-menu`

## Scripts

- Backend: `npm start`, `npm test`
- Frontend: `npm run dev`, `npm run build`, `npm run preview`

## License

MIT — see `LICENSE`.

## Support

- Issues: GitHub Issues
- Email: support@chefhub.com

—

Last Updated: November 23, 2025
Version: 2.1.0
Status: Active
