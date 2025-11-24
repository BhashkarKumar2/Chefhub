# Chefhub - AI-Powered Culinary Marketplace

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/Node.js-v18%2B-green)
![React](https://img.shields.io/badge/React-v19-blue)
![Status](https://img.shields.io/badge/Status-Active-success)

**Chefhub** is a full-stack web application that bridges the gap between culinary professionals and food enthusiasts. It features a robust booking system, real-time communication, and an AI-powered chef assistant to democratize access to professional culinary advice.

---

##  Key Features

*   **Smart Chef Discovery:** Advanced filtering to find chefs by cuisine, location, and availability.
*   **AI Chef Assistant:** Integrated **Google Gemini** for intelligent recipe suggestions and culinary tips.
*   **Seamless Booking:** Complete booking flow with status updates and history.
*   **Secure Payments:** Integrated **Razorpay** for safe and easy transactions.
*   **High Performance:** **Redis** caching for lightning-fast data retrieval.
*   **Live Tracking:** Real-time location updates for chef arrival tracking.

---

## Tech Stack

### Frontend
*   **Framework:** React 19 (Vite)
*   **Styling:** Tailwind CSS 4, Framer Motion
*   **State Management:** TanStack Query
*   **Real-time:** Socket.io Client

### Backend
*   **Runtime:** Node.js
*   **Framework:** Express.js
*   **Database:** MongoDB (Mongoose)
*   **Caching:** Redis
*   **Authentication:** Passport.js (Google/Facebook OAuth), JWT
*   **AI:** Google Generative AI (Gemini)
*   **Payments:** Razorpay
*   **Storage:** Cloudinary

---

##  Getting Started

### Prerequisites
*   Node.js (v18 or higher)
*   MongoDB (Local or Atlas)
*   Redis Server

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/chefhub.git
    cd chefhub
    ```

2.  **Backend Setup**
    ```bash
    cd backend
    npm install
    # Create .env file (see Environment Variables below)
    npm start
    ```

3.  **Frontend Setup**
    ```bash
    cd frontend
    npm install
    npm run dev
    ```

---

##  Environment Variables

Create a `.env` file in the `backend` directory with the following:

```env
PORT=5000
MONGO_URI=your_mongodb_uri
REDIS_URL=redis://localhost:6379
SESSION_SECRET=your_session_secret
JWT_SECRET=your_jwt_secret

# OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
FACEBOOK_APP_ID=...
FACEBOOK_APP_SECRET=...

# Services
GEMINI_API_KEY=...
RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

---


## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
