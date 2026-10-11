# Foundlily — Full-Stack Startup & IP Discovery Platform

> A production-ready, modular SaaS platform connecting tech startups, investors, and innovative founders across AI, FinTech, Biotech, Climate, and Quantum computing.

---

## 🏛 System Architecture & SOLID Principles

Foundlily follows strict **SOLID principles** and a **Modular Domain-Driven Architecture**:

### 1. Single Responsibility Principle (SRP)
- **Module Isolation:** Modules (`auth`, `profiles`, `social`, `admin`, `metadata`, `analytics`) manage only their single domain.
- **Layered Flow:** Request flow is decoupled across discrete layers:
  $$\text{Client} \longrightarrow \text{Router} \longrightarrow \text{Controller} \longrightarrow \text{Validator (Zod)} \longrightarrow \text{Service} \longrightarrow \text{Model (Mongoose)} \longrightarrow \text{Database}$$
- **Controller vs Service:** Controllers only handle HTTP translation and status codes. Services contain pure business logic.

### 2. Open / Closed Principle (OCP)
- **Ranking Engine:** `rankingService.ts` isolates the dynamic trending formula. New algorithmic factors can be introduced without modifying database schemas or frontend consumers:
  $$\text{Trending Score} = (\text{Views} \times 0.20) + (\text{Followers} \times 0.25) + (\text{Saves} \times 0.15) + (\text{Engagement} \times 0.20) + (\text{Recent Activity} \times 0.20)$$

### 3. Liskov Substitution Principle (LSP)
- **Dual Storage Strategy:** The service interfaces support both MongoDB Atlas and an In-Memory transactional store seamlessly without requiring callers to change execution signatures.

### 4. Interface Segregation Principle (ISP)
- **Granular Schemas:** Payloads are validated via dedicated Zod schemas (`registerSchema`, `loginSchema`, `profileCreateSchema`, `profileUpdateSchema`). No consumer is forced to supply unused fields.

### 5. Dependency Inversion Principle (DIP)
- **Pluggable Providers:** External integrations (e.g., Google Gemini 2.5 Flash AI Advisor, MongoDB Connection) are abstracted behind service wrappers.

---

## 📂 Project Structure

```
project/
├── backend/
│   └── src/
│       ├── lib/              # Database connection & JWT authentication
│       ├── middleware/       # Auth verification & Admin authorization
│       ├── models/           # Mongoose schemas with compound indexes
│       ├── modules/          # Modular domain packages
│       │   ├── admin/        # Approval workflows, moderation & dashboard stats
│       │   ├── analytics/    # Event logging & Google Gemini AI advisor
│       │   ├── auth/         # Register, login, logout, HTTP-only cookie session
│       │   ├── metadata/     # Taxonomies (Categories, Regions, Global Search)
│       │   ├── profiles/     # CRUD, slug generation, SEO, pagination
│       │   └── social/       # Follow, unfollow, save, unsave
│       ├── routes/           # Master Express router aggregating all modules
│       ├── services/         # Cross-cutting services (ranking, seed data)
│       └── utils/            # PBKDF2 password hashing & slug utility
├── docs/
│   ├── API.md                # Comprehensive REST API endpoint reference
│   └── HLD-LLD-Blueprint.md  # High-Level & Low-Level Design documentation
├── src/                      # React 19 + Vite Frontend SPA
│   ├── components/           # Reusable UI components (Navbar, Footer, ProfileCard)
│   ├── pages/                # Home, Explore, ProfileDetail, Dashboard, Admin, Auth
│   ├── services/api.ts       # Centralized API client with credentials support
│   ├── index.css             # Tailwind CSS 4 theme imports
│   └── types.ts              # TypeScript domain types
├── .env                      # Environment configuration template
├── .gitignore                # Production ignore rules
├── server.ts                 # Full-stack Node HTTP server with Vite integration
├── tsconfig.json             # TypeScript compiler configuration
└── vite.config.ts            # Vite configuration with Tailwind CSS & React plugins
```

---

## 🚀 Quick Start & Installation

### Prerequisites
- Node.js 18+ (tested with Node 22)
- npm or yarn

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
Configure your [.env](file:///.env) file:
```env
PORT=
NODE_ENV=
JWT_SECRET=your_jwt_secret_key
PASSWORD_SALT=your_password_salt_key
MONGODB_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_optional_gemini_key
ADMIN_EMAIL=your_admin_email
ADMIN_PASSWORD=your_admin_password
```

### 3. Run Development Server
```bash
npm run dev
```
Open the local application URL in your browser.

### 4. Build for Production
```bash
npm run build
npm start
```

---

## 🔑 Authentication & Administration

Admin and user accounts are configured dynamically via environment variables:

| Role | Environment Variable | Access |
|---|---|---|
| **Admin** | `ADMIN_EMAIL` & `ADMIN_PASSWORD` | Full Admin Dashboard, Approvals, Governance |
| **Founder / User** | Dynamic registration or `USER_PASSWORD` | Profile Management, Following, Bookmarking |

---

## 🔒 Security & Reliability Highlights

- **HTTP-Only Cookies:** Auth tokens are transported via `SameSite=Lax` HTTP-only cookies to prevent XSS credential exfiltration.
- **PBKDF2 Password Hashing:** 1000 rounds of SHA-512 cryptographic salting.
- **Port Conflict Handling:** Built-in auto-retry avoids `EADDRINUSE` server crashes.
- **Zod Strict Validation:** Every incoming API request body is verified against strict schemas before reaching controller logic.
- **Failover Database:** Auto-detects local/Atlas MongoDB status and falls back to an in-memory transactional cache when offline.

---

## 📄 License & Deliverables
Detailed design architecture is available in [docs/HLD-LLD-Blueprint.md](file:///docs/HLD-LLD-Blueprint.md) and endpoint specifications in [docs/API.md](file:///docs/API.md).
