# PujaConnect – Online Pandit & Puja Booking Platform

<div align="center">
  <h3>🛕 Connect Devotees with Verified Pandits for Sacred Ceremonies 🙏</h3>
</div>

---

## 📋 Project Overview

PujaConnect is a full-stack, production-quality web platform that digitizes the process of discovering, comparing, and booking verified Pandits for Hindu religious ceremonies. The platform eliminates the pain of finding trusted Pandits through personal references or phone calls by providing a structured, transparent, and modern digital experience.

**Supported Ceremonies:** Satyanarayan Katha · Naamkaran · Griha Pravesh · Havan · Mundan · Ganesh Puja · Lakshmi Puja · Vivah & more

---

## ✨ Features

### For Users (Devotees)
- 🔍 **Pandit Discovery** – Search and filter verified Pandits by city, ritual type, language, and experience
- 📋 **Detailed Profiles** – View Pandit bios, supported rituals, pricing, and availability
- 📅 **Smart Booking** – Multi-step booking wizard with availability slot selection
- 🗂️ **Booking Management** – Track pending, accepted, and upcoming bookings
- 👤 **Profile Management** – Manage personal details

### For Pandits
- 🛕 **Profile Builder** – Set up detailed profile with rituals, languages, and pricing
- 📆 **Availability Calendar** – Set available dates and time slots
- ✅ **Booking Management** – Accept or reject booking requests
- 📊 **Dashboard** – Overview of all bookings and upcoming schedule

### For Admins
- 🔒 **Pandit Verification** – Review and approve/reject Pandit profiles
- 👥 **User Management** – View and suspend users when necessary
- 🪔 **Ritual Management** – Full CRUD for the puja catalog
- 📊 **Platform Overview** – Stats and booking monitoring

### Platform Features
- 🌗 **Dark & Light Mode** – System-preference aware with manual toggle
- 📱 **Fully Responsive** – Works on mobile, tablet, and desktop
- 🔐 **JWT Authentication** – Secure role-based access control
- ⚡ **Fast & Modern** – Built with Vite + React 18

---

## 🛠 Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Frontend   | React 18 · Vite · Tailwind CSS v3 |
| Backend    | Node.js · Express.js              |
| Database   | MongoDB · Mongoose                |
| Auth       | JWT · bcryptjs                    |
| File Upload| Multer (local disk)               |
| Icons      | React Icons                       |
| Toasts     | React Hot Toast                   |
| Date Utils | date-fns                          |

---

## 🚀 Quick Start

### Prerequisites

- Node.js v18+
- MongoDB (local or cloud)
- npm or yarn

---

### 1. Clone the Repository

```bash
git clone <repo-url>
cd PujaConnect
```

---

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
```

**`backend/.env`:**
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/pujaconnect
JWT_SECRET=your_super_secret_key_change_this
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

**Run the backend:**
```bash
# Development (with auto-restart)
npm run dev

# Production
npm start
```

**Seed the database (rituals + admin account):**
```bash
npm run seed
```

> 🔑 Default admin credentials after seeding:
> - Email: `admin@pujaconnect.com`
> - Password: `Admin@1234`
> - **Change this after first login!**

---

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env
```

**`frontend/.env`:**
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

**Run the frontend:**
```bash
npm run dev
```

Frontend runs at: **http://localhost:3000**

---

## 📁 Folder Structure

```
PujaConnect/
├── backend/
│   ├── config/
│   │   └── db.js                    # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js        # Register, Login
│   │   ├── userController.js        # User profile & admin management
│   │   ├── panditController.js      # Pandit profiles & search
│   │   ├── ritualController.js      # Puja CRUD
│   │   ├── bookingController.js     # Booking lifecycle
│   │   ├── availabilityController.js # Calendar management
│   │   └── adminController.js       # Admin verification & stats
│   ├── middleware/
│   │   ├── authMiddleware.js        # JWT verification
│   │   ├── roleMiddleware.js        # RBAC guards
│   │   ├── errorMiddleware.js       # Global error handler
│   │   └── uploadMiddleware.js      # Multer photo upload
│   ├── models/
│   │   ├── User.js                  # User schema
│   │   ├── Pandit.js                # Pandit profile schema
│   │   ├── Ritual.js                # Puja/Ritual schema
│   │   ├── Booking.js               # Booking schema
│   │   └── Availability.js          # Schedule schema
│   ├── routes/                      # Express route definitions
│   ├── seed/
│   │   └── seed.js                  # Database seeder
│   ├── uploads/                     # Uploaded Pandit photos
│   ├── utils/
│   │   └── generateToken.js         # JWT helper
│   ├── .env.example
│   ├── server.js
│   └── package.json
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── api/
    │   │   ├── axios.js             # Axios instance with interceptors
    │   │   └── index.js             # All API call functions
    │   ├── components/
    │   │   ├── common/              # Navbar, Footer, ThemeToggle, ProtectedRoute
    │   │   └── pandit/              # PanditCard
    │   ├── context/
    │   │   ├── AuthContext.jsx      # Auth state & JWT
    │   │   └── ThemeContext.jsx     # Dark/Light mode
    │   ├── pages/
    │   │   ├── Home.jsx             # Landing page
    │   │   ├── Login.jsx            # Authentication
    │   │   ├── Register.jsx         # Registration with role select
    │   │   ├── PanditList.jsx       # Search & browse Pandits
    │   │   ├── PanditProfile.jsx    # Individual Pandit profile
    │   │   ├── BookingPage.jsx      # Multi-step booking wizard
    │   │   ├── Rituals.jsx          # Puja catalog
    │   │   └── dashboard/
    │   │       ├── UserDashboard.jsx    # User bookings & profile
    │   │       ├── PanditDashboard.jsx  # Pandit management
    │   │       └── AdminDashboard.jsx   # Admin panel
    │   ├── App.jsx                  # Route configuration
    │   ├── main.jsx                 # React DOM entry
    │   └── index.css                # Tailwind + design system
    ├── tailwind.config.js
    ├── vite.config.js
    └── package.json
```

---

## 🔌 API Overview

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/register` | Register user/pandit | Public |
| POST | `/api/auth/login`    | Login | Public |
| GET  | `/api/auth/me`       | Get current user | Auth |
| GET  | `/api/users/profile` | Get user profile | User |
| PUT  | `/api/users/profile` | Update user profile | User |
| GET  | `/api/pandits`       | Search verified Pandits | Public |
| GET  | `/api/pandits/:id`   | Pandit details | Public |
| POST | `/api/pandits/profile` | Create/update Pandit profile | Pandit |
| GET  | `/api/rituals`       | Get all rituals | Public |
| POST | `/api/rituals`       | Create ritual | Admin |
| PUT  | `/api/rituals/:id`   | Update ritual | Admin |
| DELETE | `/api/rituals/:id` | Delete ritual | Admin |
| POST | `/api/bookings`      | Create booking | User |
| GET  | `/api/bookings/my`   | User's bookings | User |
| GET  | `/api/bookings/pandit` | Pandit's bookings | Pandit |
| PUT  | `/api/bookings/:id/accept` | Accept booking | Pandit |
| PUT  | `/api/bookings/:id/reject` | Reject booking | Pandit |
| POST | `/api/availability`  | Set availability | Pandit |
| GET  | `/api/availability/pandit/:id` | Get Pandit's slots | Public |
| GET  | `/api/admin/stats`   | Platform stats | Admin |
| PUT  | `/api/admin/pandits/:id/verify` | Verify Pandit | Admin |
| PUT  | `/api/admin/users/:id/suspend` | Suspend user | Admin |

---

## 👥 User Roles

| Role | Description | Access |
|------|-------------|--------|
| **User** | Devotee/customer | Browse Pandits, create bookings, manage profile |
| **Pandit** | Service provider | Manage profile, availability, accept/reject bookings |
| **Admin** | Platform operator | Verify Pandits, manage users, CRUD rituals, monitor bookings |

---

## 🎨 Design System

- **Colors:** Saffron (`#F97316`) + Gold (`#D97706`) + Crimson (`#BE123C`)
- **Typography:** Playfair Display (headings) + Poppins (body)
- **Dark Mode:** Full support via Tailwind `dark:` classes
- **Theme Storage:** User preference saved to `localStorage`

---

## 🔒 Security

- Passwords hashed with `bcryptjs` (12 rounds)
- JWT tokens with configurable expiry
- Role-based middleware on all sensitive routes
- Users can only access their own data
- Suspended users cannot login

---

## 📸 Screenshots

> *Add screenshots of the application here after deployment*

- Home Page (Light Mode)
- Home Page (Dark Mode)
- Pandit Listing with Filters
- Pandit Profile with Availability
- Booking Wizard (Steps 1-4)
- User Dashboard
- Pandit Dashboard
- Admin Dashboard

---

## 🔮 Future Maintenance Notes

1. **File Storage:** Currently using local disk (`/backend/uploads`). For production, migrate to S3/Cloudinary.
2. **Email Notifications:** Add nodemailer for booking confirmations.
3. **Ratings System:** Schema hooks already prepared; activate the UI when ready.
4. **Multi-city Scaling:** Location fields support city + region + state – ready for geographic expansion.
5. **Analytics:** The KPI data is trackable via `/api/admin/stats`; integrate with a dashboard tool.
6. **Payment Gateway:** Not in scope; when adding, integrate Razorpay/Stripe after booking acceptance.

---

## 📄 License

MIT © PujaConnect 2024

---

<div align="center">Built with 🙏 for the community</div>
