# PujaConnect – Online Pandit & Puja Booking Platform

<div align="center">
  <h3>🛕 Connecting Devotees with Verified Pandits for Sacred Ceremonies 🙏</h3>
</div>

---

## 📋 Project Overview

PujaConnect is a production-quality, secure, and fully responsive full-stack web platform that simplifies the discovery, comparison, and booking of verified Pandits for Hindu religious ceremonies. The application bridges the gap between devotees seeking authentic spiritual rituals and professional Pandits offering these sacred services.

Currently booking a Pandit relies heavily on word-of-mouth or unverified channels. PujaConnect establishes transparency in pricing, schedules, and Pandit credentials, providing a seamless digital workflow for devotees and Pandits alike.

**Supported Ceremonies Include:** Satyanarayan Katha · Naamkaran · Griha Pravesh · Havan · Mundan · Ganesh Puja · Lakshmi Puja · Vivah & more (expandable catalog managed by system administrators).

---

## ✨ Core Features

### 1. User Authentication & Security
- **Secure Authentication:** JWT-based user session handling with secure cookie/header authorization.
- **Suspension Protection:** Access-control mechanism checking `isSuspended` flag on login. Suspended users are immediately denied access with a professional feedback notice.
- **Dual-Layer Validation:** Inputs are schema-validated on the backend (using `express-validator`) and dynamically checked on the frontend before form submission (matching email RFC formats, password complexity, and future-date selections).

### 2. Pandit Discovery & Search
- **Verification Gatekeeping:** Only Pandits approved by platform administrators are displayed in public search feeds.
- **Search & Filtering:** Devotees can search for verified Pandits by city and refine results by region/state, specific rituals, languages spoken, and years of experience.
- **Index Optimization:** Database queries are optimized with indexes on `location.city`, `location.region`, `verificationStatus`, `supportedRituals`, `languagesSpoken`, and `yearsOfExperience`.

### 3. Smart Booking Lifecycle
- **5-State Transaction Engine:** Bookings transition through standard statuses: `pending` ➔ `accepted` ➔ `rejected` ➔ `cancelled` ➔ `completed`.
- **History Tracking & Audit Logs:** Every state change is recorded in a `statusHistory` timeline, indicating status changes, timestamps, and optional notes.
- **Slot Selection:** Real-time checking of Pandit availability slots prevents booking conflicts.

### 4. Cloudinary Image Storage
- **Direct Buffering:** Profile photos uploaded by Pandits are processed via memory storage (`multer.memoryStorage()`) and streamed directly to Cloudinary.
- **Zero Local Disk Writes:** Images are never saved locally to server disks or stored as binary values inside the MongoDB database.
- **Three-Tier Fallback Avatar:** A robust custom component (`<PanditAvatar />`) renders:
  1. The Cloudinary secure HTTPS URL if present.
  2. Initials via the UI Avatars API with a traditional saffron background.
  3. A clean inline React Icon if network requests fail.

### 5. Traditional Spiritual Typography & UI
- **Spiritual Serif System:** Configured `Cormorant Garamond` for headings (adding a traditional, premium look) and `Source Serif 4` for body text, with fallbacks to `Georgia` and `Times New Roman`.
- **Theme Support:** Native dark and light mode stylesheets integrated seamlessly with user settings saved to `localStorage`.
- **Placeholder Redirection:** Unimplemented Resource or Trust links automatically route to a dynamic Coming Soon page that reads the active URL path to display a custom themed header.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18 · Vite · Tailwind CSS v3 · React Router DOM v6 |
| **Backend** | Node.js · Express.js · Multer (memory-only buffer uploads) |
| **Database** | MongoDB · Mongoose (with indexing & compound key configurations) |
| **Integrations** | Cloudinary SDK (Direct Upload Stream API) · UI Avatars API |
| **Auth & Security** | JWT (JSON Web Tokens) · bcryptjs (12 rounds) |
| **Validation** | express-validator (backend schemas) · Frontend regex helpers |
| **Icons & Style** | React Icons (`MdOutlineTempleHindu`, etc.) · Cormorant Garamond & Source Serif 4 |
| **Date Utilities** | date-fns |

---

## 📁 Project Structure

```text
PujaConnect/
├── backend/
│   ├── config/
│   │   ├── db.js                     # MongoDB connection wrapper
│   │   └── cloudinary.js             # Cloudinary configuration & SDK client
│   ├── controllers/
│   │   ├── authController.js         # User registration, login, and getMe sessions
│   │   ├── userController.js         # Devotee profile edits & Admin user suspension toggle
│   │   ├── panditController.js       # Pandit profile CRUD & search listings
│   │   ├── ritualController.js       # Admin ritual catalog management
│   │   ├── bookingController.js      # Booking lifecycle (create, accept, reject, complete, cancel)
│   │   ├── availabilityController.js  # Pandit availability slot scheduling
│   │   └── adminController.js        # Admin dashboard verification & platform stats
│   ├── middleware/
│   │   ├── authMiddleware.js         # JWT token verification
│   │   ├── roleMiddleware.js         # Role-based access control (RBAC) guards
│   │   ├── errorMiddleware.js        # Global Express exception handler
│   │   └── uploadMiddleware.js       # Multer configuration routing to memoryStorage
│   ├── models/
│   │   ├── User.js                   # Authentication & role schema
│   │   ├── Pandit.js                 # Pandit bio, location, pricing & verification state
│   │   ├── Ritual.js                 # Puja details, duration, and pricing schema
│   │   ├── Booking.js                # Booking transactions, timeline, & statusHistory logs
│   │   └── Availability.js           # Pandit schedule date & time slot schema
│   ├── routes/                       # Express router routes mapping requests to controllers
│   ├── seed/
│   │   └── seed.js                   # Idempotent database seeder for default rituals & admin
│   ├── utils/
│   │   ├── generateToken.js          # JWT signed token helper
│   │   └── validators.js             # express-validator schemas for input constraints
│   ├── server.js                     # Express app configuration & server startup entrypoint
│   └── package.json
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── api/
    │   │   ├── axios.js              # Axios instance configured with JWT request headers
    │   │   └── index.js              # Complete collection of REST API caller routines
    │   ├── components/
    │   │   ├── common/               # Navbar, Footer, ThemeToggle, ProtectedRoute, PanditAvatar
    │   │   └── pandit/               # PanditCard listings
    │   ├── context/
    │   │   ├── AuthContext.jsx       # Global login state, session checks & profile sync
    │   │   └── ThemeContext.jsx      # Light/Dark mode state managers
    │   ├── pages/
    │   │   ├── Home.jsx              # Landing page with Karnataka-focused search parameters
    │   │   ├── Login.jsx             # Sign-in page (secured with no visible credentials)
    │   │   ├── Register.jsx          # Register page (including min 8-char validation hints)
    │   │   ├── PanditList.jsx        # Search results page with region & language filters
    │   │   ├── PanditProfile.jsx     # Pandit profiles with booking slot selector
    │   │   ├── BookingPage.jsx       # Address & slot booking transaction wizard
    │   │   ├── Rituals.jsx           # Public catalog of pujas
    │   │   ├── PlaceholderPage.jsx   # Dynamic themed Coming Soon page for future sections
    │   │   └── dashboard/
    │   │       ├── UserDashboard.jsx    # Devotee dashboard (history logs, profile edits)
    │   │       ├── PanditDashboard.jsx  # Pandit dashboard (accept/reject/complete, scheduling)
    │   │       └── AdminDashboard.jsx   # Admin dashboard (verification flow, stats, user list)
    │   ├── App.jsx                   # React Router route registry
    │   ├── main.jsx                  # ReactDOM render bootstrap
    │   └── index.css                 # Tailwind utility imports & global font bindings
    ├── tailwind.config.js            # Font mappings and palette configuration
    ├── vite.config.js
    └── package.json
```

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js v18 or later
- MongoDB instance running locally (or MongoDB Atlas connection)
- Cloudinary free tier account

### 1. Clone & Install Dependencies

```bash
# Clone the repository
git clone https://github.com/A6h1ramahy/PujaConnect.git
cd PujaConnect

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the `backend/` directory:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/pujaconnect
JWT_SECRET=your_super_jwt_secret_key_change_in_production
JWT_EXPIRES_IN=7d
NODE_ENV=development

# Cloudinary Integration Keys
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Default Admin Seed Config
ADMIN_EMAIL=admin@pujaconnect.com
ADMIN_PASSWORD=Admin@1234
```

Create a `.env` file in the `frontend/` directory:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### 3. Run the Idempotent Database Seeder
Seed default rituals, availability ranges, and the default platform admin account:
```bash
cd backend
npm run seed
```

### 4. Running the Application locally

Start the Express backend:
```bash
cd backend
npm run dev
```

Start the React frontend dev server:
```bash
cd frontend
npm run dev
```
Open **http://localhost:3000** in your browser to view the application.

---

## 🔌 API Routes Reference

### Authentication
- `POST /api/auth/register` - Create user or pandit account.
- `POST /api/auth/login` - Authenticate user, verify isSuspended check, return JWT.
- `GET /api/auth/me` - Fetch current user profile from active JWT. *(Requires Auth)*

### Users
- `GET /api/users/profile` - Retrieve logged-in devotee profile. *(Requires Devotee Auth)*
- `PUT /api/users/profile` - Update devotee contact information. *(Requires Devotee Auth)*

### Pandits
- `GET /api/pandits` - Query verified pandits with filtering.
- `GET /api/pandits/me` - Retrieve current pandit profile details. *(Requires Pandit Auth)*
- `GET /api/pandits/:id` - Fetch detailed public info for a verified pandit.
- `POST /api/pandits/profile` - Create or update pandit biography and details. Supports Cloudinary photo uploads. *(Requires Pandit Auth)*
- `PUT /api/pandits/profile` - Update profile and photo. *(Requires Pandit Auth)*

### Rituals
- `GET /api/rituals` - Fetch all public active rituals.
- `GET /api/rituals/all` - Fetch all rituals (active/inactive). *(Requires Admin Auth)*
- `POST /api/rituals` - Add a new ritual to the system. *(Requires Admin Auth)*
- `PUT /api/rituals/:id` - Update ritual details. *(Requires Admin Auth)*
- `DELETE /api/rituals/:id` - Remove a ritual from database. *(Requires Admin Auth)*

### Bookings
- `POST /api/bookings` - Submit a new ceremony booking request. *(Requires Devotee Auth)*
- `GET /api/bookings/my` - Fetch devotee transaction history. *(Requires Devotee Auth)*
- `GET /api/bookings/pandit` - Fetch bookings assigned to the logged-in pandit. *(Requires Pandit Auth)*
- `PUT /api/bookings/:id/accept` - Mark booking status as accepted. *(Requires Pandit Auth)*
- `PUT /api/bookings/:id/reject` - Reject booking with a reason note. *(Requires Pandit Auth)*
- `PUT /api/bookings/:id/complete` - Mark accepted booking as completed. *(Requires Pandit or Admin Auth)*
- `PUT /api/bookings/:id/cancel` - Cancel a booking request. *(Requires Devotee Auth)*

### Availability
- `GET /api/availability/me` - Fetch pandit's schedule slots. *(Requires Pandit Auth)*
- `GET /api/availability/pandit/:panditId` - Query pandit availability dates & times.
- `POST /api/availability` - Set new availability dates and time slots. *(Requires Pandit Auth)*
- `PUT /api/availability/:id` - Update schedule configurations. *(Requires Pandit Auth)*
- `DELETE /api/availability/:id` - Delete schedule slot. *(Requires Pandit Auth)*

### Admin
- `GET /api/admin/stats` - Query platform-wide statistics (Users, Pandits, Bookings, Completed, Revenue). *(Requires Admin Auth)*
- `GET /api/admin/pandits/pending` - Fetch unverified Pandits awaiting approval. *(Requires Admin Auth)*
- `GET /api/admin/pandits` - Fetch all pandits. *(Requires Admin Auth)*
- `PUT /api/admin/pandits/:id/verify` - Approve a Pandit, making them visible in public listings. *(Requires Admin Auth)*
- `PUT /api/admin/pandits/:id/reject` - Reject and block a Pandit profile request. *(Requires Admin Auth)*
- `GET /api/admin/users` - List all system users. *(Requires Admin Auth)*
- `PUT /api/admin/users/:id/suspend` - Toggle user suspension status. *(Requires Admin Auth)*
- `GET /api/admin/bookings` - Query all bookings on the platform. *(Requires Admin Auth)*

---

## 👥 Role Matrix

| Capability | Devotee (User) | Pandit | Administrator |
|---|---|---|---|
| Search & view verified Pandits | Yes | Yes | Yes |
| Select slot & book ceremony | Yes | No | No |
| Accept/Reject booking request | No | Yes | No |
| Mark booking as Completed | No | Yes | Yes |
| Set schedule availability | No | Yes | No |
| Upload profile details & photos | No | Yes | No |
| Verify/Reject Pandits | No | No | Yes |
| Suspend/Unsuspend Users | No | No | Yes |
| CRUD Ritual catalog | No | No | Yes |
| View platform analytics dashboard | No | No | Yes |

---

## 🔒 Security Practices

- **Password Hashing:** Passwords securely salted and hashed using `bcryptjs` with 12 rounds.
- **JWT Authorization:** Session cookies/authorization headers signed and verified securely.
- **Access Restrictions:** Role guards prevent Users, Pandits, or Admins from triggering routes outside their authorization level.
- **Local Data Protection:** Sensitive passwords, keys, and details are completely removed from public UI code.
- **Memory-only Uploads:** Zero local storage leakages. Buffers are processed dynamically in server RAM before streaming to Cloudinary.

---

## 📸 Screenshots

> *Screenshots are captured and stored inside the assets folder for recruiters and evaluators.*

- **Home Page (Serif Typography theme)**
- **User Dashboard (Timeline tracking status)**
- **Pandit Dashboard (Calendar scheduler and booking approvals)**
- **Admin Dashboard (Verification manager and statistics charts)**
- **Booking Flow (Multi-step checkout wizard)**

---

## 🔮 Future Development Notes

1. **Ratings & Devotee Feedback:** Star reviews can be activated in the UI using existing MongoDB schemas.
2. **Notification Subsystem:** Integrate nodemailer/SMS gateways to alert devotees when bookings are accepted or completed.
3. **Geo-Location Search:** Expand location search to support latitude/longitude radius queries.
4. **Online Payment Gateway:** Integrations for Razorpay or Stripe can be initialized post Pandit approval step.

---

## 📄 License

MIT © PujaConnect 2026

---

<div align="center">Dedicated to making religious services accessible, transparent, and reliable.</div>
