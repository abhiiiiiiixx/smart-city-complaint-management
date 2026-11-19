# Smart City – Citizen Complaint Management System

A full-stack, enterprise-grade Civic Technology Web Platform developed for Indian Municipal Corporations (exemplified by Indore Municipal Corporation - ISCDL). The portal enables citizens to report neighborhood civic grievances with GPS map coordinates and photos, empowers municipal administrators with triage and automated routing tools, and provides field department officers with digital resolution proof and SLA tracking workflows.

---

## 🌟 Key Highlights & Features

- **Role-Based Portals (RBAC):**
  - **Citizen Portal:** Register, report issues with photos & GPS map pin, track live progress timeline, rate resolutions (1–5 stars), and reopen unsatisfied tickets.
  - **Department Officer Portal:** Review assigned departmental queue, mobilize maintenance squads, update ticket status, upload before/after photographic proof of resolution, and track SLA turnaround.
  - **Municipal Administrator Portal:** Executive command center, real-time Recharts analytics (Category volume, Status distribution, Inflow trends, Department performance), manual routing & officer assignment, priority overrides, and CSV dossier exports.
- **Smart Features:**
  - **Unique Auto Complaint IDs:** Sequence-backed IDs in `SC-2026-XXXX` format.
  - **Automated Priority Suggester:** Keyword safety engine that detects critical civic hazards (*"sparking wire"*, *"burst pipe"*, *"manhole"*, *"flooding"*).
  - **Nearby Duplicate Detection:** Haversine geospatial proximity alert to warn citizens if an open complaint exists within 400m in the same category.
  - **Interactive Leaflet + OpenStreetMap:** Pin-dropping location picker with custom SVG municipal markers.
  - **SLA & Resolution Time Engine:** Category-specific turnaround countdown timers flagging overdue tickets in red.
  - **In-App Event Notifications:** Live updates for citizens, officers, and admins upon ticket creation, assignment, and status transitions.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend Framework** | React 18 + TypeScript |
| **Build Tool & Bundler** | Vite 5 |
| **Styling & Design System** | Tailwind CSS (Deep Navy `#0F2942`, Teal `#0D9488`, Slate `#F8FAFC`) |
| **Icons** | Lucide React |
| **Data Visualization** | Recharts (BarChart, PieChart, AreaChart) |
| **Geospatial & Maps** | Leaflet + OpenStreetMap (via Custom SVG DivIcons) |
| **Backend & Database** | Supabase (PostgreSQL 15+), Row Level Security (RLS) |
| **Authentication** | Supabase Auth (with 1-Click Evaluation Accounts) |

---

## 🚀 Instant Quick Start

### 1. Prerequisites
- Node.js (v18 or higher)
- npm or pnpm

### 2. Installation
```bash
# Navigate to the project directory
cd smart-city-complaints

# Install dependencies
npm install

# Start development server
npm run dev
```
Open your browser at `http://localhost:3000`.

---

## 🔑 Pre-Configured Demo Accounts (1-Click Login)

For effortless project presentation and college viva evaluation, you can sign in directly with 1-click or use these demo accounts:

| Role | Name | Email | Password | Primary Capability |
| :--- | :--- | :--- | :--- | :--- |
| **Citizen** | Rahul Sharma | `citizen@smartcity.gov.in` | `Citizen@123` | File grievances, track status, rate work |
| **Department Officer** | Er. Vikram Malhotra | `officer@smartcity.gov.in` | `Officer@123` | Road Infrastructure lead, upload resolution proof |
| **Municipal Admin** | Rajeev Singhal, IAS | `admin@smartcity.gov.in` | `Admin@123` | Central Command, assign officers, view analytics |

---

## 🗄️ Supabase Database Setup Guide

1. Log in or create a free account at **[supabase.com](https://supabase.com)**.
2. Click **"New Project"** and name it `smart-city-complaints`. Choose any nearby region (e.g., *Mumbai / Singapore*).
3. In the left navigation menu, click **"SQL Editor"**.
4. Click **"New Query"**, copy the entire contents of `supabase_schema.sql`, paste it into the editor, and click **"Run"**.
5. Create another query, paste the contents of `seed_data.sql`, and click **"Run"**.
6. In Supabase, go to **Project Settings** $\rightarrow$ **API**.
7. Copy your **Project URL** and **anon public key**.
8. Paste them into your `.env` file:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-actual-anon-key
   ```
*(Note: If you run without connecting Supabase, the app automatically runs in evaluation mode using a rich local repository so you can test all 3 roles immediately!)*

---

## 📁 Project Directory Structure

```
smart-city-complaints/
├── public/
├── src/
│   ├── components/
│   │   ├── common/         # StatusBadge, PriorityBadge, SLATimerBadge, TimelineView, ImageUploader
│   │   ├── layout/         # Navbar, Sidebar, Footer
│   │   ├── map/            # LeafletComplaintMap (OpenStreetMap integration)
│   │   └── ui/             # Card, Button, Modal, Badge
│   ├── context/
│   │   ├── AuthContext.tsx       # Role-based auth provider & 1-click role switching
│   │   └── ComplaintContext.tsx  # Central complaint repository & state management
│   ├── lib/
│   │   ├── duplicateEngine.ts    # Haversine distance proximity duplicate detector
│   │   ├── mockData.ts           # 16+ realistic Indian municipal demo records (Indore)
│   │   ├── priorityEngine.ts     # Smart keyword-based safety priority analyzer
│   │   ├── supabase.ts           # Supabase client & dual-mode connection helper
│   │   └── utils.ts              # Currency (₹), date formatters, SLA calculators
│   ├── pages/
│   │   ├── admin/          # AdminDashboard, AllComplaints, ManageDepts, ManageOfficers, Reports
│   │   ├── auth/           # LoginPage, RegisterPage
│   │   ├── citizen/        # CitizenDashboard, SubmitComplaintPage, MyComplaintsPage
│   │   ├── officer/        # OfficerDashboard, AssignedComplaintsPage, OfficerPerformancePage
│   │   └── public/         # LandingPage, AboutPage, HowItWorksPage, ContactPage, Tracker, CityMap
│   ├── types/
│   │   └── database.ts     # TypeScript interfaces for database schema
│   ├── App.tsx             # Root application router and shell
│   ├── index.css           # Tailwind CSS directives and custom civic styles
│   └── main.tsx            # Vite React entry point
├── supabase_schema.sql     # Complete PostgreSQL schema, RLS policies, triggers
├── seed_data.sql           # Default departments and 10 complaint categories
├── .env.example            # Environment variables template
├── package.json
├── tailwind.config.js
└── vite.config.ts
```

---

## 🎓 College Viva / Project Defense Tips

1. **Why Supabase + PostgreSQL?**  
   PostgreSQL provides ACID compliance, foreign-key relational integrity, and spatial indexing needed for municipal governance. Supabase adds enterprise Row Level Security (RLS) ensuring citizens only modify their own tickets while officers and admins have role-scoped access.
2. **How does the duplicate detection work?**  
   It uses the **Haversine formula** to calculate great-circle distances between GPS coordinates. If an active ticket in the same category exists within 400 meters (or in the same municipal ward), the citizen is politely alerted before submission.
3. **How is priority calculated?**  
   The system employs a rule-based safety engine that scans complaint titles and descriptions for high-hazard keywords (e.g., *"fire"*, *"sparking transformer"*, *"burst pipeline"*, *"open manhole"*), escalating the ticket to **Critical** or **High** priority with reduced SLA turnaround windows.
