<p align="center">
  <h1 align="center">🚗 EzyRide — Smart Carpooling & Ride-Sharing Platform</h1>
  <p align="center">
    A full-stack, real-time ride-sharing web application with KYC verification, in-app chat, Razorpay payments, SOS safety alerts, and an admin dashboard.
  </p>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/Node.js-Express_5-339933?style=for-the-badge&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-Mongoose_8-47A248?style=for-the-badge&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/Socket.IO-4.8-010101?style=for-the-badge&logo=socket.io&logoColor=white" />
  <img src="https://img.shields.io/badge/Razorpay-Payments-0C2451?style=for-the-badge&logo=razorpay&logoColor=white" />
</p>

---

## 📖 Table of Contents

- [Introduction](#-introduction)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Architecture Overview](#-architecture-overview)
- [Database Schema](#-database-schema)
- [API Endpoints](#-api-endpoints)
- [Real-Time Communication](#-real-time-communication)
- [Authentication & Security](#-authentication--security)
- [KYC — Identity Verification](#-kyc--identity-verification)
- [Payments — Razorpay Integration](#-payments--razorpay-integration)
- [SOS — Safety System](#-sos--safety-system)
- [Admin Dashboard](#-admin-dashboard)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Deployment](#-deployment)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🚀 Introduction

**EzyRide** is a modern, full-stack carpooling and ride-sharing platform designed to connect drivers with empty seats to passengers heading in the same direction. Built as a production-ready web application, it addresses the real-world challenges of urban commuting — cost sharing, traffic reduction, and eco-friendly travel.

The platform goes beyond simple ride matching. It incorporates **AI-powered KYC verification** (face matching with Aadhaar documents), **real-time in-app chat** between drivers and passengers, **secure Razorpay payment processing**, and a **one-tap SOS emergency system** powered by Twilio. An **admin back-office** provides full operational control with analytics, user management, KYC approvals, and ride monitoring.

### 🎯 Problem Statement

Urban commuting in India faces critical challenges:
- **Rising fuel costs** making solo driving expensive
- **Traffic congestion** caused by single-occupancy vehicles
- **Safety concerns** when sharing rides with strangers
- **Trust deficit** between unknown co-travelers

### 💡 Our Solution

EzyRide provides a trusted, verified, and affordable ride-sharing ecosystem where:
- Drivers can **offset travel costs** by sharing rides
- Passengers find **affordable and convenient** commutes
- **KYC verification** ensures every user's identity is validated
- **Real-time chat & SOS** keep everyone safe
- **Seamless digital payments** eliminate cash hassles

---

## ✨ Key Features

### For Passengers 🧑‍💼
| Feature | Description |
|---|---|
| **Search Rides** | Find available rides by origin, destination, and date with Google Places autocomplete |
| **Book Seats** | Book one or multiple seats on a ride with instant confirmation |
| **Razorpay Payments** | Pay securely via UPI, cards, netbanking, or wallets |
| **Passenger Center** | Track all bookings, view ride status, start/complete rides |
| **Real-Time Chat** | Chat with the driver and co-passengers in a ride-specific room |
| **OTP Ride Start** | Verify ride start with a secure OTP code shared with the driver |
| **Rate & Review** | Leave ratings (1-5 stars) and reviews after ride completion |
| **SOS Emergency** | One-tap SOS alert to pre-configured emergency contacts via SMS |
| **Saved Searches** | Save frequent routes for quick future lookups |

### For Drivers 🚘
| Feature | Description |
|---|---|
| **Post a Ride** | Publish a ride with from, to, date, seats, price per seat, and notes |
| **Manage Rides** | View all posted rides; start, complete, or cancel them |
| **Chat with Passengers** | Coordinate via real-time chat within each ride room |
| **Ride Status Tracking** | Track ride lifecycle: `posted` → `ongoing` → `completed` / `cancelled` |
| **Earning Insights** | See booking counts and payment status for each ride |

### For Admins 🛡️
| Feature | Description |
|---|---|
| **Dashboard Overview** | Total users, rides, bookings, and revenue at a glance with analytics |
| **User Management** | View, search, and manage all registered users |
| **KYC Approvals** | Review KYC submissions (Aadhaar + selfie), approve or reject |
| **Ride Management** | Monitor all rides across the platform, filter by status |

### Platform-Wide 🌐
| Feature | Description |
|---|---|
| **KYC Verification** | AI-powered face matching between selfie and Aadhaar photo using face-api.js |
| **Forgot / Reset Password** | Email-based password reset flow powered by Nodemailer + Gmail |
| **Responsive Design** | Works seamlessly across desktop, tablet, and mobile |
| **Lazy Loading** | All pages are code-split and lazy-loaded for optimal performance |
| **Themed UI** | Consistent design system via styled-components with theme provider |

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 18** | UI library with functional components & hooks |
| **React Router v6** | Client-side routing with nested routes & protected routes |
| **Styled Components** | CSS-in-JS styling with theme support and global styles |
| **Axios** | HTTP client for REST API communication |
| **Socket.IO Client** | Real-time WebSocket communication for chat |
| **React Icons** | Iconography (FontAwesome, Material, etc.) |
| **React Webcam** | Webcam capture for KYC selfie |
| **React Google Places Autocomplete** | Location input with Google Maps API |
| **date-fns** | Lightweight date formatting and manipulation |

### Backend
| Technology | Purpose |
|---|---|
| **Node.js** | Runtime environment |
| **Express 5** | Web framework for REST API |
| **MongoDB + Mongoose 8** | NoSQL database with ODM |
| **Socket.IO** | Real-time bidirectional event-based communication |
| **JWT (jsonwebtoken)** | Stateless authentication with JSON Web Tokens |
| **bcryptjs** | Password hashing with salt |
| **Multer** | File uploads (Aadhaar documents, profile pictures) |
| **Razorpay SDK** | Payment gateway integration |
| **Twilio** | SMS-based SOS alerts to emergency contacts |
| **Nodemailer** | Email delivery for password reset |
| **face-api.js + TensorFlow.js** | AI-powered face recognition for KYC |
| **canvas** | Server-side image processing for face detection |

### DevOps & Deployment
| Technology | Purpose |
|---|---|
| **Vercel** | Frontend hosting (React SPA) |
| **Render** | Backend hosting (Node.js service) |
| **MongoDB Atlas** | Cloud-hosted database |
| **GitHub** | Version control and CI/CD |

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (React SPA)                       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────────────┐  │
│  │ AuthPage │ │  Home    │ │PostRide  │ │  PassengerCenter  │  │
│  └──────────┘ └──────────┘ └──────────┘ └───────────────────┘  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────────────┐  │
│  │SearchRide│ │ Profile  │ │ KYCPage  │ │  Admin Dashboard  │  │
│  └──────────┘ └──────────┘ └──────────┘ └───────────────────┘  │
│                         │  REST (Axios)  │ WebSocket (Socket.IO)│
└─────────────────────────┼────────────────┼──────────────────────┘
                          ▼                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SERVER (Node.js + Express)                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    Middleware Layer                      │    │
│  │  ┌──────────┐  ┌───────────┐  ┌────────────────────┐   │    │
│  │  │   CORS   │  │ JWT Auth  │  │  Multer (Uploads)  │   │    │
│  │  └──────────┘  └───────────┘  └────────────────────┘   │    │
│  └─────────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                     Route Layer (15 modules)            │    │
│  │  auth │ rides │ bookings │ chats │ kyc │ payments │ sos │    │
│  │  reviews │ profile │ dashboard │ admin │ users │ me     │    │
│  └─────────────────────────────────────────────────────────┘    │
│  ┌────────────────┐  ┌──────────────┐  ┌───────────────────┐   │
│  │  Socket.IO     │  │  Razorpay    │  │  Twilio (SMS)     │   │
│  │  (Real-Time)   │  │  (Payments)  │  │  (SOS Alerts)     │   │
│  └────────────────┘  └──────────────┘  └───────────────────┘   │
│  ┌────────────────┐  ┌──────────────┐                          │
│  │  face-api.js   │  │  Nodemailer  │                          │
│  │  (KYC/Face AI) │  │  (Email)     │                          │
│  └────────────────┘  └──────────────┘                          │
└───────────────────────────┬─────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE (MongoDB Atlas)                      │
│  ┌──────┐ ┌──────┐ ┌─────────┐ ┌──────┐ ┌────────┐ ┌─────┐   │
│  │ User │ │ Ride │ │ Booking │ │ Chat │ │ Review │ │ SOS │   │
│  └──────┘ └──────┘ └─────────┘ └──────┘ └────────┘ └─────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Database Schema

### User Model
```javascript
{
  fullName, phone, email, password,       // Core identity
  vehicle, vehicleType,                   // Vehicle info (None / Two-Wheeler / Four-Wheeler)
  preferences,                            // Ride preferences
  role,                                   // 'user' | 'admin'
  profilePicture,                         // Base64 or URL
  savedSearches: [{ origin, destination }],
  safetyPaymentSettings: {
    shareLocation, requireOTP, defaultPaymentMethod
  },
  kyc: {
    status,                               // 'none' | 'pending' | 'verified' | 'rejected'
    documents: { aadhaarFront, aadhaarBack, selfie },
    matchScore                            // Face similarity score (0-100%)
  },
  resetPasswordToken, resetPasswordExpires
}
```

### Ride Model
```javascript
{
  from, to, date,                         // Route & schedule
  seatsAvailable, pricePerSeat,           // Capacity & pricing
  postedBy: ObjectId → User,              // Driver reference
  passengerIds: [ObjectId → User],        // Passenger list
  status,                                 // 'posted' | 'ongoing' | 'completed' | 'cancelled'
  notes                                   // Additional info from driver
}
// Indexed on: from, to, date, status
```

### Booking Model  
```javascript
{
  ride: ObjectId → Ride,
  user: ObjectId → User,
  seatsBooked, status, bookingDate,
  ride_start_code, ride_start_code_used,  // OTP verification
  paymentStatus,                          // 'pending' | 'succeeded' | 'failed' | 'refunded'
  razorpayOrderId, razorpayPaymentId      // Payment tracking
}
```

### Chat, Review & SOS Models
```javascript
// Chat — Real-time ride messaging
{ ride → Ride, sender → User, message, timestamps }

// Review — Post-ride ratings
{ reviewer → User, reviewee → User, rating (1-5), comment, bookingId → Booking }

// SOS — Emergency contacts
{ user → User, contacts: [{ name, phone, relation }], message }
```

---

## 📡 API Endpoints

### Authentication (`/api/auth`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/register` | Register new user |
| `POST` | `/login` | Login & get JWT |
| `POST` | `/forgot-password` | Send password reset email |
| `POST` | `/reset-password` | Reset password with token |

### Rides (`/api/rides`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Search rides (query: from, to, date) |
| `POST` | `/` | Post a new ride (auth required) |
| `GET` | `/my-rides` | Get current user's posted rides |
| `PATCH` | `/:id/status` | Update ride status (start/complete/cancel) |

### Bookings (`/api/bookings`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/` | Book a ride |
| `GET` | `/my-bookings` | View user's bookings |
| `PATCH` | `/:id/cancel` | Cancel a booking |
| `POST` | `/:id/verify-otp` | Verify ride start OTP |

### Payments (`/api/payments/razorpay`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/create-order` | Create a Razorpay order |
| `POST` | `/verify` | Verify payment signature |
| `POST` | `/refund` | Process refund |

### KYC (`/api/kyc`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/submit` | Submit KYC documents (Aadhaar + selfie) |
| `GET` | `/status` | Check KYC verification status |

### Chat (`/api/chats`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/:rideId` | Fetch chat history for a ride |

### SOS (`/api/sos`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Get SOS contacts |
| `POST` | `/` | Save/update emergency contacts |
| `POST` | `/trigger` | Trigger SOS alert (sends SMS via Twilio) |

### Reviews (`/api/reviews`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/` | Submit a review |
| `GET` | `/user/:userId` | Get reviews for a user |

### Admin (`/api/admin`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/users` | List all users |
| `GET` | `/analytics` | Platform analytics data |
| `PATCH` | `/kyc/:userId/approve` | Approve KYC |
| `PATCH` | `/kyc/:userId/reject` | Reject KYC |

---

## 💬 Real-Time Communication

EzyRide uses **Socket.IO** for real-time features:

```
Client  ──── socket.connect() ────>  Server
        <──── authenticated ────────
        ──── chat:join {rideId} ──>  Server joins user to ride room
        ──── chat:message {text} ─>  Server broadcasts to ride room
        <──── chat:message ────────  All members receive message
        ──── chat:typing ─────────>  Typing indicators
```

**Security:** Socket connections are authenticated via JWT tokens. Only the driver or a confirmed passenger can join a ride's chat room — verified against the `Ride` and `Booking` collections.

---

## 🔐 Authentication & Security

| Layer | Implementation |
|---|---|
| **Password Storage** | bcryptjs with 10 salt rounds |
| **Auth Tokens** | JWT signed with `JWT_SECRET`, sent via `Authorization: Bearer <token>` |
| **Route Protection** | `authMiddleware.js` verifies JWT on all protected endpoints |
| **Client Guards** | `ProtectedRoute` component redirects unauthenticated users |
| **Socket Auth** | JWT verification in Socket.IO handshake middleware |
| **CORS** | Configurable origin via `CORS_ORIGIN` env variable |
| **File Uploads** | 50MB limit with Multer for document/image uploads |
| **OTP Verification** | Ride start codes prevent unauthorized ride starts |

---

## 🪪 KYC — Identity Verification

EzyRide implements a multi-step KYC pipeline:

```
1. User uploads Aadhaar front + back + live selfie (via webcam)
          ▼
2. Backend receives images via Multer
          ▼
3. face-api.js (TensorFlow.js) extracts face descriptors from:
   - Aadhaar photo
   - Live selfie
          ▼
4. Euclidean distance calculated between face descriptors
          ▼
5. Match score generated (0-100%)
          ▼
6. If score > threshold → auto-verified OR sent to admin for review
          ▼
7. Admin dashboard shows all pending KYC submissions for manual approval
```

**Tech Used:** `@vladmandic/face-api` + `@tensorflow/tfjs` + `canvas` (server-side rendering)

---

## 💳 Payments — Razorpay Integration

```
┌─────────────┐     ┌──────────────┐     ┌───────────┐
│   Client    │────>│  Backend     │────>│  Razorpay │
│  (React)    │     │  (Express)   │     │   API     │
│             │     │              │     │           │
│  1. Book    │     │ 2. Create    │     │ 3. Order  │
│     Ride    │────>│    Order     │────>│  Created  │
│             │     │              │<────│           │
│  4. Pay via │     │              │     │           │
│   Razorpay  │────>│ 5. Verify   │────>│ 6. Valid  │
│   Checkout  │     │   Signature  │<────│           │
│             │<────│ 7. Confirm   │     │           │
│  8. Success │     │   Booking    │     │           │
└─────────────┘     └──────────────┘     └───────────┘
```

**Supported Methods:** UPI, Credit/Debit Cards, Netbanking, Wallets  
**Features:** Order creation, signature verification, refund processing

---

## 🆘 SOS — Safety System

- Users can configure up to **multiple emergency contacts** (name, phone, relation)
- Customize the SOS message
- **One-tap SOS trigger** sends SMS to all contacts via **Twilio API**
- Default message: *"I need help. This is my live location."*

---

## 🛡️ Admin Dashboard

The admin panel (`/admin/*`) provides a complete back-office:

| Page | Features |
|---|---|
| **Dashboard Overview** | Total users, rides, revenue, bookings count, analytics charts |
| **User Management** | Search, view, and manage all users |
| **KYC Management** | View pending KYC submissions, approve/reject with document preview |
| **Ride Management** | Monitor all rides, filter by status (posted/ongoing/completed/cancelled) |

---

## 📁 Project Structure

```
ezyride/
├── public/                     # Static assets & index.html
├── src/                        # React Frontend
│   ├── App.js                  # Root component with routing
│   ├── index.js                # Entry point
│   ├── context/
│   │   └── AuthContext.js      # Authentication state management
│   ├── components/
│   │   ├── Layout.js           # Main app shell (navbar, sidebar)
│   │   ├── AdminLayout.js      # Admin panel shell
│   │   ├── AutocompleteInput.js # Google Places input
│   │   ├── ChatPanel.js        # Real-time chat UI
│   │   ├── WebcamCapture.js    # KYC selfie capture
│   │   ├── RideStatusUpdate.js # Ride lifecycle controls
│   │   ├── PrivateRoute.js     # Auth guard
│   │   └── ProtectedRoute.js   # Auth guard
│   ├── pages/
│   │   ├── AuthPage.js         # Login & Register
│   │   ├── Home.js             # Dashboard homepage
│   │   ├── PostRide.js         # Post a new ride form
│   │   ├── SearchRides.js      # Search & filter rides
│   │   ├── PassengerCenter.js  # Booking management & chat
│   │   ├── MyPostedRides.js    # Driver's ride management
│   │   ├── Profile.js          # User profile & settings
│   │   ├── KYCPage.js          # KYC verification flow
│   │   ├── MyBookings.js       # Booking history
│   │   ├── ForgotPassword.js   # Forgot password form
│   │   ├── ResetPassword.js    # Reset password form
│   │   └── admin/
│   │       ├── DashboardOverview.js
│   │       ├── AdminKYC.js
│   │       ├── UserManagement.js
│   │       └── RideManagement.js
│   ├── styles/
│   │   ├── theme.js            # Design tokens & theme config
│   │   └── GlobalStyles.js     # Global CSS reset & base styles
│   └── utils/                  # Helper utilities
│
├── backend/                    # Node.js Backend
│   ├── server.js               # Express app + Socket.IO setup
│   ├── .env                    # Environment variables
│   ├── middleware/
│   │   └── authMiddleware.js   # JWT verification middleware
│   ├── models/
│   │   ├── User.js             # User schema with KYC & preferences
│   │   ├── Ride.js             # Ride schema with indexes
│   │   ├── Booking.js          # Booking with OTP & Razorpay
│   │   ├── Chat.js             # Real-time chat messages
│   │   ├── Review.js           # Ratings & reviews
│   │   └── SOS.js              # Emergency contacts
│   ├── routes/
│   │   ├── auth.js             # Authentication routes
│   │   ├── rides.js            # Ride CRUD
│   │   ├── bookings.js         # Booking management
│   │   ├── chats.js            # Chat history
│   │   ├── kyc.js              # KYC processing
│   │   ├── payments.razorpay.js # Razorpay integration
│   │   ├── sos.js              # SOS emergency system
│   │   ├── reviews.js          # Review system
│   │   ├── profile.js          # Profile management
│   │   ├── me.js               # Current user data
│   │   ├── users.js            # User operations
│   │   ├── dashboard.js        # Dashboard data
│   │   ├── rideStatus.js       # Ride status updates
│   │   ├── admin.js            # Admin operations
│   │   └── adminAnalytics.js   # Analytics data
│   └── utils/                  # Backend utilities
│
├── render.yaml                 # Render deployment config
├── vercel.json                 # Vercel SPA rewrite rules
└── package.json                # Frontend dependencies
```

---

## ⚡ Getting Started

### Prerequisites

- **Node.js** v18.17.0 or above
- **MongoDB** (local or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))
- **Razorpay Account** ([dashboard.razorpay.com](https://dashboard.razorpay.com))
- **Twilio Account** ([twilio.com](https://www.twilio.com)) for SOS SMS
- **Gmail App Password** for Nodemailer email delivery
- **Google Places API Key** for location autocomplete

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/just-ritesh-coder/ezyride.git
cd ezyride

# 2. Install frontend dependencies
npm install

# 3. Install backend dependencies
cd backend
npm install
cd ..
```

### Running Locally

```bash
# Terminal 1 — Start the backend server
cd backend
npm run dev          # Uses nodemon for hot-reload (port 5000)

# Terminal 2 — Start the React frontend
npm start            # Runs on port 3000, proxied to backend
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Environment Variables

Create a `.env` file inside the `backend/` directory:

```env
# Database
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/ezyride

# Authentication
JWT_SECRET=your_jwt_secret_key

# Server
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
CLIENT_URL=http://localhost:3000

# Razorpay
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx

# Twilio (SOS Alerts)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+1xxxxxxxxxx

# Email (Password Reset)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
```

---

## 🚢 Deployment

### Frontend → Vercel
- Framework: **Create React App**
- Build command: `npm run build`
- Output directory: `build/`
- SPA rewrites configured in `vercel.json`

### Backend → Render
- Environment: **Node.js**
- Build command: `cd backend && npm install`
- Start command: `cd backend && npm start`
- Configured via `render.yaml`

---

## 📸 Screenshots

> _Coming soon — Add screenshots of the Home page, Ride Search, Passenger Center, Chat, KYC Flow, Admin Dashboard, and more._

---

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

---

## 📄 License

This project is private and proprietary. All rights reserved.

---

<p align="center">
  Made with ❤️ by <strong>Ritesh</strong>
</p>
