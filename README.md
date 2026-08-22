# Khabarbari (খাবারবাড়ি)

An online food ordering platform featuring SSLCommerz Payment Gateway, real-time chat facility and notification system.

---

# 🌐 Demo

- **Live Website:** [https://khabar-bari-frontend.vercel.app](https://khabar-bari-frontend.vercel.app)

---

# 🧩 Features

### Functional Features

- **Pay Online:** Users can pay online through `SSLCommerz Payment Gateway`.
- **Download Receipt:** Users can `download order receipts`.
- **Chat:** `Bidirectional communication` between the client and the store admin through chat.
- **Get Notified:** `Real-time notification` to notify relevant party about new order placement, order status change and receipt of chat message.
- **Control Panel:** `Control panel` for both admin and non-admin users.
- **Search, Filter & Pagination:** Users can `search` for food items. They can also `search` and `filter` their orders by parameters like orderID and completion status. `Pagination` enabled for better UX.

---

### Non-Functional Features

- **Rate Limiting:** `Sliding-Window Rate limiting` implemented to prevent bot attacks.
- **Authentication & Authorization:** `Token-based` authentication and `Role-based` authorization implemented.
- **Online Status Indicator:** `Status indicator` enabled in chat to see who is online.
- **Password Reset:** Authenticated users can `reset password` from control panel. Unauthenticated users can reset if they `forget password`.
- **Bengali Format:** `Bengali numeral formatting` implemented for all types of numerical calculation.
- **Frontend PDF Generation:** PDF generated `in the clients browser` to eliminate server-side rendering overhead.
- **Optimized Image Uploads:** Upload images from the frontend `directly to the Cloudinary server` bypassing our Node.js server using `pre-signed URLs` to reduce CPU overhead of our backend server.
- **Search, Filter & Pagination:** Utilized MongoDB `indexing` and limit/skip `pagination` to efficiently serve search results.
- **Caching:** Utilized `Redis` to cache hot data like `password reset tokens with TTLs` to reduce database read and write overhead.
- **Toast Notifications:** Integrated `react-hot-toast` to provide UI feedback for important updates.
- **Email Dispatch:** Integrated `nodemailer` to send emails for `password reset verification link`.
- **WebSocket:** `Socket.io` utilized to eliminate costly HTTP polling for live chats and notifications.
- **Responsive Layout:** Adaptive UI developed by `Tailwind CSS`.

---

# 🛠️ Tech Stack

### Frontend

- **Structure and State Management:** React
- **Styling:** Tailwind CSS
- **Real-Time Communication:** Socket.io-client

### Backend

- **Runtime:** Node.js, Express.js
- **Database:** MongoDB
- **Real-Time Communication:** Socket.io

### Deployment & Infrastructure

- **Frontend:** Vercel
- **Backend:** Render
- **Database:** MongoDB Atlas
- **Redis Cache:** Upstash Redis
