# 🛕 PujaConnect

<div align="center">

### Connecting Devotees with Verified Pandits for Sacred Ceremonies Across India 🙏

A modern full-stack platform for discovering, booking, and managing verified Pandits for religious ceremonies and rituals across multiple regions of India.

[Live Demo](#) • [Features](#-major-features) • [Technology](#-technology-stack) • [Roles](#-user-roles)

</div>

---

## 📊 Project Overview

**PujaConnect** is a production-ready digital platform that bridges the gap between devotees seeking authentic spiritual rituals and professional Pandits offering sacred services. 

In traditional contexts, booking a Pandit relied heavily on word-of-mouth recommendations or unverified channels, creating challenges in transparency, pricing consistency, and service reliability. PujaConnect solves these problems by providing:

- **Transparency**: Clear pricing, verified credentials, and published schedules
- **Trust**: Admin-verified Pandits with detailed profiles and ratings
- **Accessibility**: Multi-region support with 100+ rituals across India
- **Convenience**: Seamless digital workflow for devotees and Pandits alike
- **Communication**: Built-in messaging system for direct user-Pandit interaction

The platform operates as an interconnected ecosystem with three primary user roles: **Users** (devotees seeking services), **Pandits** (service providers), and **Admins** (platform managers ensuring quality and compliance).

---

## ✨ Core Objectives

The PujaConnect platform is designed to achieve the following objectives:

| Objective | Description |
|-----------|-------------|
| **✓ Trusted Pandit Discovery** | Enable users to discover verified Pandits with comprehensive profiles and credentials |
| **✓ Ritual Management** | Maintain and curate an extensive catalog of rituals (100+) across multiple categories |
| **✓ Online Booking** | Provide a seamless slot-based booking system with real-time availability |
| **✓ Availability Scheduling** | Allow Pandits to manage custom time slots with automatic conflict prevention |
| **✓ Direct Communication** | Enable real-time messaging between users and Pandits for coordination and queries |
| **✓ Multi-Region Support** | Support rituals and Pandits across diverse regions of India |
| **✓ Administrative Control** | Empower admins to verify Pandits, manage platform content, and ensure data integrity |

---

## 🛠 Technology Stack

### Frontend
- **React** 18 - Modern UI library with hooks
- **Vite** - Lightning-fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework for responsive design
- **React Router DOM** - Client-side routing and navigation
- **Axios** - Promise-based HTTP client for API communication
- **Framer Motion** - Smooth animations and transitions
- **React Icons** - Comprehensive icon library

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js** - Fast and flexible web framework
- **Multer** - Middleware for file uploads (memory-based streaming)

### Database & ODM
- **MongoDB** - NoSQL document database
- **Mongoose** - ODM with schema validation and indexing

### Authentication & Security
- **JWT (JSON Web Tokens)** - Stateless authentication
- **bcryptjs** - Password hashing with 12-round salt
- **Role-Based Access Control (RBAC)** - Multi-tier authorization

### Cloud & Integrations
- **Cloudinary** - Cloud image storage and optimization
- **UI Avatars API** - Fallback avatar generation

### Utilities
- **date-fns** - Modern date manipulation library

---

## 👥 User Roles

PujaConnect operates with three distinct user roles, each with specific capabilities and responsibilities:

### 👤 User (Devotee)
Users are individuals seeking ritual services. They can:
- ✓ Create and manage accounts
- ✓ Search and browse Pandits by name, city, or region
- ✓ Filter and discover rituals by category
- ✓ View Pandit profiles, credentials, and availability
- ✓ Book Pandits for specific rituals and dates
- ✓ Select available time slots for ceremonies
- ✓ Provide booking address and special requirements
- ✓ Accept or cancel bookings
- ✓ Communicate with Pandits through messaging
- ✓ Track booking history and status
- ✓ Manage profile and update personal information
- ✓ Change password and delete account

### 🕉️ Pandit (Service Provider)
Pandits are verified service providers offering ritual expertise. They can:
- ✓ Create and verify professional profiles
- ✓ Manage pricing for individual rituals
- ✓ Define supported rituals and languages
- ✓ Create custom availability slots
- ✓ Set multiple slots for different time periods
- ✓ Accept or reject booking requests
- ✓ Communicate with users through messaging
- ✓ Track upcoming schedule and bookings
- ✓ View booking history and completed ceremonies
- ✓ Manage profile information and credentials

### 👨‍💼 Admin (Platform Manager)
Admins manage the platform, ensure quality, and maintain data integrity. They can:
- ✓ Verify and approve Pandits
- ✓ Manage user accounts and suspend problematic users
- ✓ Manage Pandit accounts and suspensions
- ✓ View and manage all bookings on the platform
- ✓ Create and manage the ritual catalog (100+ rituals)
- ✓ Modify ritual details, categories, and pricing
- ✓ Create additional administrator accounts
- ✓ Delete user or Pandit accounts when necessary
- ✓ View platform statistics and analytics
- ✓ Monitor booking trends and platform activity

---

## ⭐ Major Features

### Authentication & Security
- ✓ **JWT Authentication** - Secure token-based authentication with expiration
- ✓ **Role-Based Access Control** - Fine-grained permission system for each user role
- ✓ **Protected Routes** - Frontend and backend route protection based on roles
- ✓ **Secure Password Handling** - bcryptjs hashing with 12-round salt
- ✓ **Input Validation** - Dual-layer validation (backend + frontend)
- ✓ **API Protection** - Middleware-based access control on all endpoints
- ✓ **Account Suspension** - Ability to suspend problematic users with immediate access denial

### Pandit Discovery & Search
- ✓ **Verified Pandit Listings** - Only admin-approved Pandits are visible
- ✓ **Name Search** - Search Pandits by full name
- ✓ **City Filtering** - Find Pandits available in specific cities
- ✓ **Region Filtering** - Filter by geographic region
- ✓ **Ritual Filtering** - Search Pandits by supported rituals
- ✓ **Language Filtering** - Find Pandits who speak required languages
- ✓ **Experience Filtering** - Filter by years of experience
- ✓ **Advanced Search** - Combine multiple filters for precise results

### Ritual Catalog
- ✓ **100+ Rituals** - Comprehensive catalog of Hindu ceremonies and rituals
- ✓ **Ritual Categories** - Organized by type (Pujas, Samskaras, Festivals, etc.)
- ✓ **Detailed Information** - Duration, significance, and traditional guidelines
- ✓ **Search Functionality** - Find rituals by name or category
- ✓ **Advanced Filtering** - Filter by region, cost, or requirements
- ✓ **Featured Rituals** - Highlight popular or trending ceremonies
- ✓ **Admin Management** - Create, update, and manage ritual catalog

### Booking System
- ✓ **Ritual Selection** - Choose from available rituals
- ✓ **Date Selection** - Pick ceremony dates with calendar interface
- ✓ **Slot-Based Booking** - Select from Pandit's available time slots
- ✓ **Address Collection** - Capture ceremony location details
- ✓ **Booking Requests** - Submit requests for Pandit approval
- ✓ **Request Status Flow** - Pending → Accepted/Rejected → Completed/Cancelled
- ✓ **One-Hour Buffer** - Automatic conflict prevention with buffer time
- ✓ **Automatic Slot Locking** - Prevent double-booking during transaction
- ✓ **Automatic Slot Release** - Release slots if bookings expire or are cancelled
- ✓ **Booking Expiration** - Auto-cancel bookings that are not accepted timely
- ✓ **Cancellation System** - Users can cancel; Pandits can reject
- ✓ **Booking History** - Maintain complete record of all bookings with timestamps

### Availability Management
- ✓ **Custom Slot Creation** - Pandits create custom time slots
- ✓ **Multiple Slots** - Support for multiple slots on same day
- ✓ **Date Range Selection** - Create recurring or specific availability
- ✓ **Conflict Detection** - Prevent overlapping slots automatically
- ✓ **Real-Time Updates** - Availability updates instantly on the platform
- ✓ **Slot Duration** - Configurable duration for each slot
- ✓ **Slot Deletion** - Remove or modify available slots

### Messaging System
- ✓ **Booking-Based Chat** - Direct messaging tied to specific bookings
- ✓ **User ↔ Pandit Communication** - Seamless conversation interface
- ✓ **Message History** - Complete message thread for each booking
- ✓ **Read Receipts** - Track when messages are read
- ✓ **Unread Badges** - Visual indicators for unread messages
- ✓ **Real-Time Updates** - Messages appear instantly
- ✓ **Conversation Threading** - Organized by booking for clarity

### User Experience
- ✓ **Dark Mode** - Fully functional dark theme with theme persistence
- ✓ **Light Mode** - Default light theme for day-time usage
- ✓ **Responsive Design** - Optimized for desktop, tablet, and mobile
- ✓ **Smooth Animations** - Framer Motion transitions and interactions
- ✓ **Modern Cards** - Clean, professional card-based layouts
- ✓ **Mobile Support** - Touch-friendly interface and gestures
- ✓ **Professional Design** - Premium UI with spiritual aesthetics
- ✓ **Loading States** - Skeleton loaders and spinners for feedback
- ✓ **Toast Notifications** - Non-intrusive success and error messages
- ✓ **Spiritual Typography** - Cormorant Garamond & Source Serif fonts

### Profile Management
- ✓ **User Profiles** - Display personal information and booking history
- ✓ **Pandit Profiles** - Showcase credentials, experience, and available rituals
- ✓ **Profile Photos** - Upload and display profile images via Cloudinary
- ✓ **Avatar Fallbacks** - Smart fallback system: Cloudinary URL → Initials → Icon
- ✓ **Password Change** - Secure password update mechanism
- ✓ **Account Deletion** - Users can delete their accounts permanently

### Cloud & Media
- ✓ **Cloudinary Integration** - Professional image storage and optimization
- ✓ **Memory-Based Uploads** - No local disk writes; stream directly to cloud
- ✓ **Secure URLs** - HTTPS image delivery with automatic optimization
- ✓ **Zero Local Storage** - Images never stored on server disk

---

## 📖 Ritual Management

PujaConnect maintains an extensive ritual catalog supporting Hindu ceremonies across India:

### Ritual Catalog
- **100+ Rituals** - Comprehensive collection of verified rituals
- **Multiple Categories** - Organized by type and occasion:
  - Daily Pujas (Surya Puja, Lakshmi Puja, etc.)
  - Life Ceremonies (Naamkaran, Mundan, Vivah, etc.)
  - Festivals (Durga Puja, Diwali, Holi celebrations)
  - House Rituals (Griha Pravesh, Vastu Pujan)
  - Remedial Ceremonies (Navagraha Shanti, etc.)

### Search & Discovery
- **Ritual Search** - Find rituals by name or keyword
- **Category Filtering** - Browse by ritual type
- **Regional Variations** - Rituals with regional customizations
- **Featured Rituals** - Highlight popular or trending ceremonies
- **Pandit Compatibility** - See which Pandits offer each ritual

### Admin Controls
- **Create Rituals** - Add new rituals to the platform
- **Update Details** - Modify ritual information anytime
- **Manage Categories** - Organize rituals hierarchically
- **Price Management** - Set standard pricing guidelines
- **Deprecate Rituals** - Remove rituals when needed

---

## 📅 Booking System

The booking system provides a robust transaction engine for ceremony reservations:

### Booking Workflow
```
User Initiates → Selects Ritual → Chooses Date → Selects Slot → 
Provides Address → Submits Request → Pandit Reviews → 
Accepts/Rejects → Booking Confirmed/Cancelled
```

### Booking States
- **Pending** - Initial state; awaiting Pandit confirmation
- **Accepted** - Pandit approved; booking confirmed
- **Rejected** - Pandit declined; user can rebook
- **Cancelled** - User or expiration triggered cancellation
- **Completed** - Ceremony finished; booking archived

### Features
- **State History** - Complete audit log of all status changes
- **Automatic Expiration** - Pending bookings expire after set duration
- **One-Hour Buffer** - Enforced gap between consecutive bookings
- **Real-Time Availability** - Slots locked during transaction
- **Conflict Prevention** - No double-booking possible
- **Cancellation Rights** - Users can cancel anytime; Pandits can reject

---

## ⏰ Availability Management

Pandits have full control over their schedules:

### Custom Slots
- **Time-Based Slots** - Define availability by specific time windows
- **Multiple Slots** - Create several slots on the same day
- **Duration Control** - Set slot length (typically 1-4 hours)
- **Date Selection** - Specify exact dates or date ranges

### Slot Protection
- **Conflict Prevention** - System prevents overlapping slots
- **Automatic Locking** - Slots lock when booking is confirmed
- **Automatic Unlocking** - Slots unlock if booking is cancelled
- **Real-Time Updates** - Availability reflects instantly
- **Buffer Enforcement** - One-hour gap maintained between bookings

---

## 💬 Messaging System

Real-time communication between users and Pandits:

### Features
- **Booking-Linked Chat** - Messages tied to specific bookings
- **Direct Messaging** - One-to-one conversations
- **Message History** - Full thread of all communications
- **Read Status** - Track message read receipts
- **Unread Notifications** - Badge count for unread messages
- **Conversation Threading** - Organized by booking context

### Use Cases
- Ask questions about rituals
- Clarify ceremony requirements
- Discuss special requests
- Confirm booking details
- Reschedule if needed

---

## 🌏 Multi-Regional Support

PujaConnect supports Pandits and rituals across India:

### Supported Regions
- 🏛️ Karnataka
- 🏛️ Maharashtra
- 🏛️ Delhi
- 🏛️ West Bengal
- 🏛️ Tamil Nadu
- 🏛️ Telangana
- 🏛️ Uttar Pradesh

### Language Support
- 🗣️ Kannada
- 🗣️ Hindi
- 🗣️ Sanskrit
- 🗣️ Marathi
- 🗣️ Bengali
- 🗣️ Tamil
- 🗣️ Telugu

### Regional Variations
- Rituals adapted to regional traditions
- Pandits specialized in regional practices
- Local pricing considerations
- Regional festival calendars

---

## 🔒 Security Features

PujaConnect implements comprehensive security measures:

| Security Layer | Implementation |
|---|---|
| **Authentication** | JWT token-based with secure expiration |
| **Authorization** | Role-Based Access Control (RBAC) |
| **Protected Routes** | Frontend and backend route guards |
| **Password Security** | bcryptjs with 12-round hashing |
| **Input Validation** | Server-side schema validation + client-side checks |
| **API Protection** | Middleware-based authentication on all endpoints |
| **Account Management** | User suspension mechanism for problematic accounts |
| **Data Integrity** | Mongoose schema validation |
| **HTTPS Ready** | Secure cloud media delivery via Cloudinary |

---

## 👨‍💼 Admin Features

Comprehensive administrative dashboard for platform management:

### User Management
- View all users with account status
- Suspend or unsuspend problematic users
- Delete user accounts if necessary
- Monitor user activity and booking history

### Pandit Management
- View all Pandits with verification status
- Approve or reject Pandit registrations
- Suspend or unsuspend Pandit accounts
- Monitor Pandit ratings and reviews
- Manage Pandit credentials and verification

### Booking Management
- View all bookings across the platform
- Monitor booking status and timeline
- Intervene in disputes between users and Pandits
- Generate booking reports and statistics

### Ritual Management
- Create new rituals in the catalog
- Update existing ritual information
- Manage ritual categories and pricing
- View ritual popularity and demand

### Dashboard Analytics
- Total users, Pandits, and bookings
- Pending verifications queue
- Recent activity feed
- Platform statistics and trends

---

## 🎨 User Experience Design

PujaConnect prioritizes a professional, modern user experience:

### Visual Design
- ✓ Clean, minimalist interface
- ✓ Spiritual aesthetic with Cormorant Garamond typography
- ✓ Consistent color scheme and branding
- ✓ Professional card-based layouts
- ✓ Smooth transitions and animations

### Accessibility
- ✓ Responsive design for all devices
- ✓ Touch-friendly mobile interface
- ✓ Fast loading with optimized images
- ✓ Clear navigation and information hierarchy
- ✓ Accessible form validation

### Theme Support
- ✓ Dark mode for low-light environments
- ✓ Light mode for day-time usage
- ✓ Theme preference saved in browser
- ✓ Smooth theme switching transitions

---

## 🚀 Future Scope

PujaConnect is positioned for future expansion:

- **📱 Mobile Applications** - Native iOS and Android apps for on-the-go booking
- **💳 Online Payments** - Integrated payment gateway for direct transactions
- **📹 Video Consultations** - Pre-ceremony video consultation with Pandits
- **🎬 Live Rituals** - Stream ceremonies for remote participation
- **🔔 Notification Services** - Push notifications for bookings and messages
- **⭐ Review System** - User ratings and reviews for Pandits
- **📊 Advanced Analytics** - Detailed reporting for platform insights

---

## 📊 Project Status

```
🟢 Production Ready
━━━━━━━━━━━━━━━━━
Status: Fully Functional
Version: 1.0.0
Last Updated: June 2026
```

All core features implemented, tested, and ready for deployment. The application operates as a complete, production-ready platform for Pandit discovery and booking.

---

## 👨‍💻 About the Developer

**Abhirama H Y**

- 🎓 Computer Science Engineering
- 🏫 PES University
- 💼 Full-Stack Developer

### Connect
- 🔗 [LinkedIn](#)
- 🐙 [GitHub](#)
- 🌐 [Portfolio](#)

---

<div align="center">

### 🙏 PujaConnect - Connecting Devotion with Service

*A modern platform bridging the sacred gap between devotees and verified Pandits.*

</div>
## 📂 Project Structure

```text
PujaConnect/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── seed/
│   └── server.js
│
├── frontend/
│   ├── public/
│   │
│   ├── src/
│   │   ├── api/
│   │   │   ├── axios.js
│   │   │   └── index.js
│   │   │
│   │   ├── components/
│   │   │   ├── common/
│   │   │   └── pandit/
│   │   │
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Rituals.jsx
│   │   │   ├── PanditList.jsx
│   │   │   ├── PanditProfile.jsx
│   │   │   ├── BookingPage.jsx
│   │   │   └── dashboard/
│   │   │       ├── UserDashboard.jsx
│   │   │       ├── PanditDashboard.jsx
│   │   │       └── AdminDashboard.jsx
│   │   │
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   │
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
└── README.md
```

### Key Modules

| Module            | Description                          |
| ----------------- | ------------------------------------ |
| Authentication    | JWT-based secure authentication      |
| Ritual Management | 100+ rituals with categories         |
| Pandit Discovery  | Search, filters, and profiles        |
| Booking System    | Slot-based booking workflow          |
| Availability      | Custom scheduling system             |
| Messaging         | User ↔ Pandit communication          |
| Dashboards        | User, Pandit, and Admin portals      |
| Administration    | Verification and platform management |


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
