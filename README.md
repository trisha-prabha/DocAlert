# 🛡️ DocAlert — AI-Powered Expiry & Warranty Tracker

An intelligent full-stack expiry and warranty management system featuring automated AI document extraction, real-time tracking, 3D interactive visuals, and automated multi-stage email reminders.

---

## ✨ Features

- 🤖 **AI Vision Document Extraction**: Upload receipts, warranty cards, and invoices to automatically extract product names, purchase dates, warranty expiry dates, vendors, prices, and serial numbers using Gemini AI.
- 🎨 **Modern 3D Interface**: Built with Three.js / Canvas interactive particles, dynamic tilt cards, glassmorphic design system, and sleek dark mode UI.
- 📊 **Comprehensive Dashboard**: Real-time status tracking (`Active`, `Expiring Soon`, `Expired`), interactive calendar view, category filters, and smart search.
- ⏰ **Automated Email Reminders**: Multi-stage background cron alerts (30, 15, 7, and 1 day before expiry) sent via Resend.
- 🔐 **Secure Authentication**: JWT-based authentication & Firebase OAuth integration with secure password hashing.
- ☁️ **Cloud Storage**: Seamless receipt and invoice attachment uploads stored via Cloudinary.

---

## 🛠️ Tech Stack

### Frontend (`client/`)
- **React 18** (Vite)
- **TailwindCSS** + Lucide React Icons
- **Three.js** / Canvas 3D Graphics & Animations
- **Axios** for API client communication
- **Firebase Auth** (Google Login support)

### Backend (`server/`)
- **Node.js** & **Express.js**
- **MongoDB** & **Mongoose**
- **Google Gemini AI SDK** (Document / Receipt Vision Extraction)
- **Cloudinary** (Secure File & Image Storage)
- **Resend** (Automated Email Notification Service)
- **Node-Cron** (Scheduled expiry checks and notification dispatching)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB instance (local or MongoDB Atlas)
- npm or yarn

### 1. Clone the repository
```bash
git clone https://github.com/shashwata777/Expirey-Tracker.git
cd Expirey-Tracker
```

### 2. Backend Setup
```bash
cd server
npm install
```

Create a `.env` file in the `server` directory (refer to `.env.example`):
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/expiryguard
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=30d

# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Resend Email Service
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=onboarding@resend.dev

# Client URL
CLIENT_URL=http://localhost:5173
```

Start the backend server:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd ../client
npm install
```

Create a `.env` file in the `client` directory (refer to `.env.example`):
```env
VITE_API_URL=http://localhost:5000/api

# Firebase Web App Config
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
```

Start the frontend development server:
```bash
npm run dev
```

---

## 📁 Project Structure

```
Expirey-Tracker/
├── client/                     # Vite React Frontend
│   ├── src/
│   │   ├── components/         # 3D visuals, dashboard, upload modal, forms
│   │   ├── context/            # Authentication context
│   │   ├── hooks/              # Custom hooks for auth and items
│   │   ├── pages/              # Dashboard, Upload, Detail, Login, Settings
│   │   └── services/           # Axios API client
│   └── package.json
├── server/                     # Express Node.js Backend
│   ├── config/                 # Database, Cloudinary, Mailer config
│   ├── controllers/            # Auth, Item, Extraction, User controllers
│   ├── middleware/             # Auth, validation, file upload middleware
│   ├── models/                 # Mongoose schemas (User, Item, ReminderLog)
│   ├── routes/                 # API route definitions
│   ├── services/               # Gemini AI vision, Cron, Cloudinary storage
│   └── server.js
├── .gitignore                  # Excludes .env, secrets, and node_modules
└── README.md
```

---

## 🔒 Security Note

- **Never commit `.env` files or API keys** to source control.
- Sample environment variables are documented in `.env.example` files.

---

## 📄 License

This project is licensed under the MIT License.
