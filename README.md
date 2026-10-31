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
- **Online Status Indicator:** `Online Status indicator` in chat to see who's online.
- **Notification:** `Real-time notification` to notify relevant party about important events.
- **Control Panel:** `Control panel` for both admin and customers.
- **Audit Log:** `System-wide` audit logging to keep track of important activities.
- **Search, Filter & Pagination:** Search, Filter & Pagination implemented `to improve UX`.
- **Password Reset:** Authenticated users can `reset` their password. Unauthenticated users can reset if they `forget` their password.
- **Toast Notifications:** Integrated `react-hot-toast` to provide UI feedback.

### Non-Functional Features

- **Type Safety:** TypeScript integrated in order to maintain data consistency and prevent runtime crashes due to type mismatch.
- **Rate Limiting:** `Sliding-Window Rate limit` to prevent bot attacks.
- **Dual-Token Authentication (AT/RT):** `Access-Token` paired with `Refresh-Token` to authenticate users.
- **Role-Based Access Control (RBAC):** `Role based access` for admin and non-admin users.
- **Background Job:** To ensure the HTTP threads are not blocked and the clients are not kept in a loading state for prolonged period, `heavy backend jobs` such as audit-log generation is offloaded to `asynchronous background workers`.
- **WebSocket:** To eliminate costly HTTP polling in order to get the latest chats and notifications, `websocket` is utilized.
- **Search, Filter & Pagination:** Utilized MongoDB `indexing` and limit/skip `pagination` to efficiently serve search results.
- **Optimized Image Uploads:** To reduce backend server load by uploading multimedia files from the frontend directly to the Cloudinary server, `Valet-Key pattern` is implemented with `pre-signed URLs`
- **Caching:** Utilized `Redis` to cache hot data like recipe items and password `reset tokens with TTLs` to reduce database read and write overhead.
- **Email Dispatch:** Integrated `nodemailer` to send emails for `password reset verification link`.
- **Frontend PDF Generation:** PDF generation delegated to `clients browser` to eliminate server-side rendering overhead.

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
