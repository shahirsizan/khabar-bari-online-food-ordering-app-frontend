# Khabarbari (খাবারবাড়ি) 🍲

An online food ordering platform featuring real-time chat facility, SSLCommerz payment gateway and notification system.

---

## 🚀 Live Demo

- **Frontend (Vercel):** [https://khabar-bari-client.vercel.app](https://khabar-bari-client.vercel.app)
- **Backend API (Render):** [https://khabar-bari-backend.onrender.com](https://khabar-bari-backend.onrender.com)

---

## ✨ Key Features

- **🍔 Interactive Recipe & Menu Catalog:** Real-time quantity updates with custom localized Bengali numeral formatting.
- **🛒 Persistent Cart Management:** Dynamic cart state powered by React Context with instant price calculations.
- **🛡️ Custom Global Rate Limiter:** Protects backend endpoints with a sliding-window rate-limiting algorithm and a global client popup modal (`GlobalRateLimitModal`).
- **💬 Real-Time Admin Chat:** WebSockets (Socket.io) integration for direct messaging between customers and platform admins.
- **🔐 Authentication & Authorization:** Protected routes, guest routes, and secure user management with password reset functionality.
- **📱 Responsive & Smooth UI:** Tailwind CSS layout enhanced with AOS (Animate on Scroll) animations.

---

## 🛠️ Tech Stack

### Frontend

- **Framework:** React 18 (Vite)
- **Styling:** Tailwind CSS, AOS
- **Routing:** React Router DOM v6
- **Real-Time Communications:** Socket.io-client

### Backend

- **Runtime:** Node.js, Express.js
- **Database:** MongoDB & Mongoose ORM
- **Real-Time Engine:** Socket.io
- **Security & Middleware:** CORS, Custom Rate Limiter, Body-Parser

### Deployment & Infrastructure

- **Client Hosting:** Vercel
- **Server Hosting:** Render
- **Database Hosting:** MongoDB Atlas

---

## 📂 Project Structure

```text
khabarbari/
├── client/                     # Vite React Frontend
│   ├── src/
│   │   ├── assets/             # Images and static assets
│   │   ├── components/         # Reusable UI components (Modal, Navbar, etc.)
│   │   ├── pages/              # Route pages (Landing, Profile, Orders, etc.)
│   │   ├── utils/              # API fetch wrappers and helpers
│   │   ├── App.jsx             # Route definitions and main entry
│   │   └── main.jsx
│   ├── .env.development        # Development environment variables
│   ├── .env.production         # Production environment variables
│   └── package.json
│
└── server/                     # Express Node.js Backend
    ├── controllers/            # Request handlers
    ├── middleware/             # Rate limiters & Auth checks
    ├── model/                  # Mongoose schemas (User, Message, Notification, etc.)
    ├── routes/                 # API endpoint routers
    ├── utils/                  # Socket.io & DB connection helpers
    ├── server.js               # Entry point
    └── package.json
```
