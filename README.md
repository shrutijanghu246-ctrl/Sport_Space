# 🏅 SportSpace

A real-time college sports management platform built for NIT Kurukshetra's sports community.

## 🔗 Live Demo
**Frontend:** https://sport-space-frontend.onrender.com  
**Backend API:** https://sport-space.onrender.com

> Note: Hosted on Render free tier — first load may take 30-60 seconds to spin up.

## 🚀 Features

- **Authentication** — Register/Login with Email OTP verification via Nodemailer
- **Role-based Access** — Admin, Captain (Boys/Girls), Coach, Member, Vice captain roles
- **Team Management** — Create teams, add/remove members, assign captains
- **Feed** — Instagram-style posts + structured training logs with likes & comments
- **Real-time Chat** — Team chat with delete for me / delete for everyone (Socket.io)
- **Real-time Notifications** — Instant notifications for new posts and announcements
- **Achievements Wall** — Team and personal achievement tracking
- **Public Athlete Profiles** — Shareable public profiles with achievements and posts
- **Diet Tracker** — Log meals with calorie/macro tracking + Indian food autocomplete database
- **Exercise Recommendations** — Coach/captain curated sport-specific exercise library

## 🛠️ Tech Stack

### Backend
- Node.js + Express.js
- MongoDB + Mongoose
- Socket.io (real-time features)
- JWT + bcryptjs (authentication)
- Nodemailer (email OTP)

### Frontend
- React (Vite)
- CSS Modules
- Lucide React (icons)
- Axios
- Socket.io-client
- React Router DOM

## 📁 Project Structure
SportSpace/
├── backend/
│   ├── config/         # Database connection
│   ├── controllers/    # Route handlers
│   ├── middleware/     # Auth middleware
│   ├── models/         # Mongoose schemas
│   ├── routes/         # API routes
│   ├── utils/          # Email, seed scripts
│   └── server.js       # Entry point
├── frontend/
│   ├── src/
│   │   ├── components/ # Reusable components
│   │   ├── context/    # Auth + Socket context
│   │   ├── pages/      # Page components
│   │   └── utils/      # Axios instance
│   └── index.html

## 🔧 Local Setup

### Backend
```bash
cd backend
npm install
# Create .env file with:
# MONGODB_URI=your_mongodb_uri
# JWT_SECRET=your_secret
# EMAIL_USER=your_gmail
# EMAIL_PASS=your_app_password
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 👩‍💻 Built By

**Shruti Janghu** — Civil Engineering, NIT Kurukshetra  
Vice Captain, Girls Athletics Team  
[GitHub](https://github.com/shrutijanghu246-ctrl) | [LinkedIn]([your_linkedin](https://www.linkedin.com/in/shruti-janghu-930644379
))

---

*Built as an original full-stack project to solve a real problem — NIT KKR had no dedicated sports platform.*
