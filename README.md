# Khabarbari (খাবারবাড়ি)

An online food ordering platform featuring SSLCommerz Payment Gateway, real-time chat and notification system.

---

# 🌐 Demo

- **Live Website:** [https://khabar-bari-frontend.vercel.app](https://khabar-bari-frontend.vercel.app)

---

# 🧩 Features

### Functional Features

- **Pay Online:** Users can pay online through `SSLCommerz`.
- **Download Receipt:** Users can `download order receipts`.
- **Chat:** `Bidirectional communication` between the client and the store admin.
- **Get Notified:** `Real-time notification` to notify relevant party about important events.
- **Control Panel:** `Control panel` for both admin and customers.
- **Activity Log:** `System-wide` activity logging to keep track of different activities.
- **Search, Filter & Pagination:** Search, Filter & Pagination implemented `to improve UX`.

### Non-Functional Features

- **Rate Limiting:** `Sliding-Window Rate limit` to prevent bot attacks.
- **Dual-Token Authentication (AT/RT):** `Access-Token` paired with `Refresh-Token` to authenticate users.
- **Role-Based Access Control (RBAC):** `Role based access` for admin and non-admin users.
- **Activity Logging:** Admin can inspect system-wide activity logs in their admin panel.
- **Online Status Indicator:** `Online Status indicator` in chat to see who's online.
- **Password Reset:** Authenticated users can `reset` their password. Unauthenticated users can reset if they `forget` their password.
- **Background Job:** The task to track and log activities is `Offloaded as background tasks` using BullMQ to ensure the main request-response cycles are not blocked.
- **WebSocket:** `Socket.io` utilized to eliminate costly HTTP polling for live chats and notifications.
- **Search, Filter & Pagination:** Utilized MongoDB `indexing` and limit/skip `pagination` to efficiently serve search results.
- **Optimized Image Uploads:** Admin can upload images from the frontend `directly to the Cloudinary server` bypassing our Express server using `pre-signed URLs` to reduce our server CPUs computation overhead.
- **Caching:** Utilized `Redis` to cache hot data like recipe items and password `reset tokens with TTLs` to reduce database read and write overhead.
- **Toast Notifications:** Integrated `react-hot-toast` to provide UI feedback.
- **Email Dispatch:** Integrated `nodemailer` to send emails for `password reset verification link`.
- **Frontend PDF Generation:** PDF generation delegated to `clients browser` to eliminate server-side rendering overhead.
- **Bengali Format:** `Bengali` numeral formatting implemented for all types of numerical calculation.

---

# 🛠️ Tech Stack

### Frontend

- **Structure and State Management:** React
- **Styling:** Tailwind CSS
- **Real-Time Communication:** Socket.io-client

### Backend

- **Runtime:** Node.js, Express.js
- **Database:** MongoDB
- **Background Worker:** BullMQ
- **Real-Time Communication:** Socket.io

### Deployment & Infrastructure

- **Frontend:** Vercel
- **Backend:** Render
- **Database:** MongoDB Atlas
- **Redis & Message Broker:** Upstash Redis
