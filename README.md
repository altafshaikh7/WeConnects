# 🚀 LinkedIn Clone (MERN Stack)

A full-stack LinkedIn clone built using MERN stack with secure authentication and Google OAuth.

---

## 🔥 Features

* 🔐 User Authentication (Signup / Login)
* 🔑 Forgot Password (Email Reset Link)
* 🔁 Reset Password with Token
* 🌐 Google Login (OAuth 2.0)
* 🧠 JWT आधारित Authentication
* 🗄 MongoDB Database Integration
* ⚡ REST API (Node.js + Express)

---

## 🛠 Tech Stack

**Frontend:**

* React.js
* Tailwind CSS
* Axios

**Backend:**

* Node.js
* Express.js
* MongoDB (Mongoose)
* JWT Authentication
* Passport.js (Google OAuth)

---

## 🔐 Environment Variables

Create a `.env` file in backend:

```
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret
EMAIL_USER=your_email
EMAIL_PASS=your_app_password
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
```

---

## 🚀 Installation

### Backend

```
cd backend
npm install
npm run dev
```

### Frontend

```
cd frontend
npm install
npm run dev
```

---

## 📌 API Endpoints

### Auth

* POST `/api/auth/register`
* POST `/api/auth/login`
* POST `/api/auth/forgot-password`
* POST `/api/auth/reset-password/:token`
* GET `/api/auth/google`

---

## 📸 Screenshots

(Add your screenshots here later)

---

## 💡 Future Improvements

* 📝 Post Creation (Feed System)
* ❤️ Like & Comment System
* 👥 User Profile Enhancement
* 🔔 Notifications

---

## 👨‍💻 Author

**Altaf Shaikh**

---

⭐ If you like this project, give it a star!
