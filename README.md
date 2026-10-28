# SmartSpend — Production-Grade AI-Powered Expense & Budget Manager

SmartSpend is an AI-powered personal expense tracking, budgeting, and financial intelligence application engineered with a modern full-stack architecture:
- **Mobile Frontend**: React Native, Expo, TypeScript (Strict), Expo Router, and Custom Neo-Fintech Design Tokens.
- **Backend API**: Node.js, Express, TypeScript (Strict), Zod validation, and OpenAPI specifications.
- **Database**: PostgreSQL with Prisma ORM, 3NF normalized schema, and integer minor units (paise) for absolute monetary precision.
- **AI Copilot**: Server-side provider-independent adapter with deterministic financial pre-aggregation and zero-hallucination guardrails.
- **Monorepo**: pnpm workspaces (`apps/mobile`, `apps/api`, `packages/shared`).

---

## 🌟 Key Features

1. **Tactile & Ergonomic Mobile UI**
   - **Home Dashboard**: Live Safe Monthly Balance (`₹16,550.00`), pacing bar (`63%` spent), Today's Spending pace vs daily target (`₹840.00` / `₹1,200.00`), and recent transaction ledger.
   - **Tactile Keypad Entry**: Full numeric keypad (`0-9`, `.`, `⌫`) with quick preset chips (`+₹50`, `+₹100`, `+₹500`, `+₹1,000`), expense/income switcher, category carousel, and payment method chips.
   - **Activity & Search**: Real-time multi-field search (merchants, notes, tags), date grouping (*Today*, *Yesterday*, date headers), filter chips, and statement CSV export.
   - **Analytics & Insights**: 2×2 metric grid, 7-day spending pace bar chart with daily target threshold line, category distribution bars, and upcoming subscription autopays.
   - **Budgets Tab**: Overall monthly spending limit controls, safe daily pace calculation, and category-level limits with alert thresholds.
   - **Profile & Settings**: Dark/Light mode switcher, preferred currency (`INR ₹`), timezone, audio/haptic clicks toggle, encrypted archive export, and account deletion.

2. **Interactive Modals & Tools**
   - **AI Financial Copilot**: Conversational chat with suggested query chips (*"Can I afford dinner tonight?"*, *"Where did most of my money go this month?"*), backed by live database numbers or deterministic rule engine.
   - **Scan UPI Simulator**: Laser scanning viewfinder animation with quick sample QR presets (*Blue Tokai*, *Uber Premier*, *Blinkit Groceries*).
   - **Notifications Center**: In-app alert history (budget threshold warnings, subscription autopay reminders) with unread counter.

3. **Deterministic Financial Integrity**
   - Authoritative daily allowance calculation:
     $$\text{Daily Allowance} = \frac{\max(0, \text{Budget Limit} - \text{MTD Expenses})}{\max(1, \text{Days Remaining})}$$
   - Exact integer minor units: All amounts stored and computed in **paise** (`1 INR = 100 paise`), preventing floating-point rounding drift.

---

## 📁 Repository Structure

```
smartspend/
├── apps/
│   ├── mobile/               # React Native + Expo Android Mobile App
│   │   ├── app/              # Expo Router File-Based Navigation
│   │   │   ├── (auth)/       # Login, Register, Forgot Password
│   │   │   ├── (tabs)/       # Home, Activity, Insights, Budgets, Profile
│   │   │   ├── modal/        # Add Transaction, AI Assistant, Scan UPI, Notifications
│   │   │   ├── onboarding/   # Introduction Carousel
│   │   │   └── _layout.tsx   # Root navigation stack & providers
│   │   ├── src/
│   │   │   ├── components/   # UI Design System (CurrencyText, TransactionRow, Keypad, etc.)
│   │   │   ├── theme/        # Design Tokens (#172033, #F7F8F5, #B8F36B)
│   │   │   ├── services/     # API Client with Android 10.0.2.2 auto-resolution
│   │   │   └── hooks/        # React Query hooks (useDashboard, useTransactions)
│   │   ├── assets/           # App icons, splash, and adaptive icons
│   │   └── package.json
│   │
│   └── api/                  # Node.js + Express + Prisma REST API
│       ├── src/              # Layered controllers, services, repositories
│       ├── prisma/           # PostgreSQL schema & seed script
│       ├── tests/            # Vitest unit & integration test suites
│       └── package.json
│
├── packages/
│   └── shared/               # Shared TypeScript types, Zod schemas, constants, and money utils
│
├── docs/                     # Technical documentation suite
│   ├── PRD.md                # Product Requirements Document
│   ├── ARCHITECTURE.md       # Full-Stack System Architecture
│   ├── DATABASE.md           # PostgreSQL Data Dictionary & ERD
│   ├── API.md                # REST API Specification (/api/v1)
│   ├── SECURITY.md           # Security & Cryptography Guidelines
│   ├── TESTING.md            # Testing Strategy & Verification Matrix
│   ├── DEPLOYMENT.md         # Production Deployment Runbook
│   └── DEVELOPMENT.md        # Developer Setup Guide
│
├── infra/
│   ├── docker/               # Production API Dockerfile
│   └── docker-compose.yml    # PostgreSQL + Express API composition
│
├── scripts/                  # Development automation scripts
├── .env.example              # Documented environment variable template
├── pnpm-workspace.yaml       # Monorepo configuration
├── tsconfig.base.json        # Shared TypeScript strict configuration
└── package.json              # Workspace scripts
```

---

## 🚀 Quick Local Setup (Development Workstation)

### 1. Prerequisites
- **Node.js**: v20.x or v22.x LTS
- **Package Manager**: `pnpm` (v9+) or `npm` (v10+)
- **PostgreSQL**: Local PostgreSQL v15+, Docker, or cloud PostgreSQL (e.g. Supabase)

### 2. Environment Configuration
Copy the template file to create your local `.env`:
```bash
cp .env.example .env
```
Ensure your `DATABASE_URL` is set:
- **Local Docker PostgreSQL**: `postgresql://postgres:postgres@localhost:5432/smartspend?schema=public`
- **Cloud Supabase**: Paste your Supabase connection strings from the Supabase dashboard.

### 3. Database Initialization & Seeding
```bash
# 1. Install all monorepo dependencies
pnpm install

# 2. Generate Prisma Client
pnpm db:generate

# 3. Push schema to database
pnpm db:push

# 4. Seed demo categories, rules, and fintech transactions
pnpm db:seed
```

### 4. Running the Development Servers
In **Terminal 1** (Backend API):
```bash
pnpm dev:api
```
*API is live at `http://localhost:4000/api/v1` (Health check: `http://localhost:4000/api/v1/health`).*

In **Terminal 2** (Mobile Application or Web Preview):
```bash
# Start Expo Mobile App
pnpm dev:mobile

# OR start the Full-Stack Web App Preview (with reverse proxy)
npm start
```

---

## 📱 Multi-Device Setup & Usage Guide

SmartSpend is designed to run seamlessly across physical mobile devices, tablets, secondary development computers, and web browsers. Choose the method that fits your setup:

| Option | Best For | Prerequisites |
| :--- | :--- | :--- |
| **[Option 1: Physical Phone via Expo Go](#-option-1-run-mobile-app-on-a-physical-phone-android--ios-via-expo-go)** | Real Android / iPhone hardware testing with touch & haptics | Expo Go app on phone + Same Wi-Fi (or Tunnel) |
| **[Option 2: Browser on Another Device](#-option-2-access-the-web-app-from-any-devices-browser-no-installs)** | Instant testing on iPad, tablet, or another phone/PC | Zero installs — just open your browser |
| **[Option 3: Setup on Another Computer](#-option-3-setting-up-smartspend-on-another-computer-windows--macos--linux)** | New development machine (Mac, Windows, Linux) | Node.js, pnpm, Git |
| **[Option 4: Standalone Android APK](#-option-4-build-a-standalone-android-apk-no-expo-go-required)** | Production-like APK install on Android devices | EAS CLI build |
| **[Option 1C: USB Debugging (ADB Reverse)](#-option-1c-usb-cable-connection-via-adb-reverse-ultra-fast--offline)** | Fast, offline phone testing with zero network lag | Android USB cable + ADB |

---

### 📲 Option 1: Run Mobile App on a Physical Phone (Android / iOS) via Expo Go

Use the **Expo Go** app to instantly preview and test SmartSpend on your actual smartphone.

#### Step 1: Install Expo Go
- **Android**: Install [Expo Go from Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent).
- **iOS**: Install [Expo Go from Apple App Store](https://apps.apple.com/app/expo-go/id982107779).

#### Step 2: Connect Phone and PC to the Same Wi-Fi
Ensure your smartphone and computer running SmartSpend are connected to the **same local Wi-Fi network** or mobile hotspot.

#### Step 3: Find Your Host Computer's Local IP Address
Open a terminal on your computer:
- **Windows**:
  ```powershell
  ipconfig
  ```
  Look for **IPv4 Address** under your active Wi-Fi adapter (e.g. `192.168.1.45`).
- **macOS / Linux**:
  ```bash
  ip a   # Linux
  # or
  ipconfig getifaddr en0   # macOS
  ```

#### Step 4: Configure the API URL in `.env`
In the root `.env` file on your computer, set `EXPO_PUBLIC_API_URL` using your host computer's IP:
```env
EXPO_PUBLIC_API_URL="http://192.168.1.45:4000/api/v1"
```
*(Replace `192.168.1.45` with your actual IP address found in Step 3).*

#### Step 5: Start the Backend API
```bash
pnpm dev:api
```
The backend automatically binds to `0.0.0.0:4000` so devices on your local network can reach it.

#### Step 6: Start the Expo Development Server
```bash
pnpm dev:mobile
```
A QR code and Metro bundler menu will display in your terminal.

#### Step 7: Open the App on Your Phone
- **Android**: Open the **Expo Go** app, tap **"Scan QR Code"**, and scan the terminal QR code.
- **iOS**: Open the native **Camera** app, point it at the terminal QR code, and tap the prompt to open in Expo Go.

---

### 🌐 Option 1B: Use Expo Cloud Tunnel (Bypasses Router / Wi-Fi Restrictions)

If your Wi-Fi router blocks device-to-device communication (**AP Isolation** in university, office, or public Wi-Fi) or your phone is using mobile cellular data:

```bash
# In apps/mobile directory:
cd apps/mobile
npx expo start --tunnel
```
*Expo creates an encrypted cloud tunnel URL so your phone can load the app from anywhere, regardless of local firewall restrictions.*

---

### 🔌 Option 1C: USB Cable Connection via ADB Reverse (Ultra-Fast & Offline)

For Android devices when you want zero network latency and offline reliability:

1. Enable **Developer Options** and **USB Debugging** on your Android phone.
2. Connect the phone to your computer via USB cable.
3. Forward the API and Metro bundler ports:
   ```bash
   adb reverse tcp:4000 tcp:4000
   adb reverse tcp:8081 tcp:8081
   ```
4. Start Expo:
   ```bash
   pnpm dev:mobile
   ```
5. Press **`a`** in the terminal — Expo will install and launch directly on your connected phone!

---

### 💻 Option 2: Access the Web App from Any Device's Browser (No Installs)

You can access the responsive SmartSpend web interface from an iPad, tablet, iPhone, Android phone, or another laptop on the same network without installing anything.

1. On your host computer, start both backend API and web server:
   ```bash
   # Terminal 1: Backend API
   pnpm dev:api

   # Terminal 2: Web Server & Reverse Proxy
   npm start
   ```
2. The terminal output will display your local network URL:
   ```
   ========================================
     SmartSpend Neo-Fintech Server Active  
   ========================================
     > Local:   http://localhost:3000
     > Network (Wi-Fi): http://192.168.1.45:3000
   ========================================
   ```
3. Open **Safari**, **Chrome**, or **Edge** on your other device and navigate to:
   ```
   http://192.168.1.45:3000
   ```
   *(Use your PC's IP address and port 3000).*

> [!TIP]
> **Install as PWA**: In Safari on iOS, tap **Share** > **"Add to Home Screen"**. On Android Chrome, tap the three dots > **"Add to Home screen"**. The web app will launch full-screen like a native app!

---

### 🖥️ Option 3: Setting Up SmartSpend on Another Computer (Windows / macOS / Linux)

To set up and run the entire development environment on a brand-new computer:

#### Step 1: Install System Prerequisites
- [Node.js v20+ LTS](https://nodejs.org/)
- [pnpm](https://pnpm.io/installation) (`npm install -g pnpm`)
- [Git](https://git-scm.com/)
- [Docker Desktop](https://www.docker.com/) (optional, if you want local PostgreSQL)

#### Step 2: Clone the Repository
```bash
git clone <your-repository-url> Smart-Spend
cd Smart-Spend
```

#### Step 3: Configure Environment Variables
```bash
cp .env.example .env
```
Edit `.env` with your preferred database credentials (or use cloud Supabase keys).

#### Step 4: Install Dependencies
```bash
pnpm install
```

#### Step 5: Initialize the Database
```bash
# Generate Prisma types
pnpm db:generate

# Push database schema
pnpm db:push

# Populate database with categories and demo transactions
pnpm db:seed
```

#### Step 6: Launch Applications
- Start Backend API: `pnpm dev:api`
- Start Mobile App: `pnpm dev:mobile`
- Start Web App: `npm start`

> [!NOTE]
> **Windows PowerShell Users**: If you encounter an execution policy error (`running scripts is disabled`), run:
> ```powershell
> Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
> ```

---

### 📦 Option 4: Build a Standalone Android APK (No Expo Go Required)

To distribute an installable `.apk` file that can be permanently installed on any Android device:

1. Install EAS CLI:
   ```bash
   npm install -g eas-cli
   ```
2. Log in with your free Expo account:
   ```bash
   eas login
   ```
3. Run the APK build inside `apps/mobile`:
   ```bash
   cd apps/mobile
   eas build -p android --profile preview
   ```
4. Once completed, EAS will provide a direct download link for the `.apk`.
5. Download the `.apk` on your target Android device, open it, and tap **Install**!

---

## 🛡️ Firewall & Network Troubleshooting

If your other device cannot connect to your host computer:

### 1. Allow Ports in Windows Defender Firewall
Run this command in an **Administrator PowerShell** on your host PC:
```powershell
New-NetFirewallRule -DisplayName "SmartSpend Dev Ports" -Direction Inbound -LocalPort 3000,4000,8081 -Protocol TCP -Action Allow
```

### 2. Verify Connectivity from the Other Device
Open the browser on your phone/other device and test the health check URL:
```
http://<YOUR_PC_IP>:4000/api/v1/health
```
If this returns `{"status":"ok"}`, your network connection and firewall settings are properly configured!

### 3. Common Issues & Solutions

| Issue | Cause | Solution |
| :--- | :--- | :--- |
| **"Network request failed" on phone** | Phone cannot reach `localhost` or PC IP | Set `EXPO_PUBLIC_API_URL=http://<YOUR_PC_IP>:4000/api/v1` in `.env` and restart Expo. |
| **Connection timed out / page won't load** | Windows Firewall blocking port 3000/4000 | Add inbound firewall rule or temporarily allow Node.js on Private networks. |
| **Router blocks device communication** | Wi-Fi Client Isolation is enabled on router | Use mobile hotspot or use `npx expo start --tunnel`. |
| **"Could not connect to development server"** | Metro bundler unreachable | Check that PC and phone are on the exact same Wi-Fi SSID (e.g. not 2.4GHz vs 5GHz guest network). |
| **Database error during startup** | PostgreSQL is not running | Start Docker (`docker compose -f infra/docker-compose.yml up -d`) or verify Supabase `DATABASE_URL`. |

---

## 🧪 Testing & Verification

```bash
# Run Backend Vitest Test Suite (Unit & Integration tests)
pnpm test

# Run TypeScript strict type-check across all workspaces
pnpm typecheck

# Build all packages
pnpm build
```

---

## 📚 Documentation Quicklinks

- [Product Requirements Document (PRD)](docs/PRD.md)
- [System Architecture](docs/ARCHITECTURE.md)
- [Database Schema & ERD](docs/DATABASE.md)
- [REST API Specification](docs/API.md)
- [Security & Authorization](docs/SECURITY.md)
- [Testing Matrix](docs/TESTING.md)
- [Deployment Runbook](docs/DEPLOYMENT.md)
- [Developer Onboarding](docs/DEVELOPMENT.md)
