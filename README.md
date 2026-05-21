# StaffEra Ecosystem

StaffEra is a premium, real-time instant staffing and home-services mobile platform ecosystem inspired by Uber, Snabbit, and Urban Company. It enables high-reliability matching, secure wallet and subscription transactions, and real-time provider location coordinate tracking.

---

## 🏗️ Repository Architecture

The project is structured into three main directories:

1.  **`/backend`**: Node.js + Express + TypeScript API server. Manages the database models (via Prisma ORM), authentication pipelines, and real-time Socket.io handshakes.
2.  **`/mobile`**: Unified React Native (TypeScript) application. Exposes both Customer and Partner flows under a single codebase, dynamically switchable using a developer mode toggle.
3.  **`/admin-dashboard`**: A premium Vite + React + TypeScript administrative console styled with an Obsidian-Glassmorphism UI. Features charts, KYC checkpoints, and a WebSocket GPS route simulator.

---

## 🚀 How to Run the Ecosystem

### Option A: Standard Local Execution (Recommended for Development)

Ensure you have **Node.js (v18+)**, **PostgreSQL**, and **Redis** running locally.

#### 1. Setup & Start Backend Server
```bash
cd backend

# Install dependencies
npm install

# Apply database migrations
npx prisma migrate dev --name init

# Populate mock coordinates, service catalogs, and Gold membership plans
npm run prisma:seed

# Launch the API & WebSockets server in developer watch mode
npm run dev
```
*The server boots on [http://localhost:5000](http://localhost:5000).*

#### 2. Start the Vite Admin Dashboard
```bash
cd admin-dashboard

# Install dependencies
npm install

# Start the dev server
npm run dev
```
*The web portal typically runs on [http://localhost:5173](http://localhost:5173).*

#### 3. Launch the Mobile Client
```bash
cd mobile

# Install dependencies
npm install

# Start Metro Bundler
npm start
```
From the interactive Metro terminal, choose your target simulator:
*   Press `i` to launch the **iOS Simulator**.
*   Press `a` to launch the **Android Emulator**.

---

### Option B: Containerized Staging Deployment (Using Docker)

To run the platform services inside isolated container environments:

#### 1. Run the Backend API Server
```bash
cd backend
docker build -t staffera-backend .
docker run -d -p 5000:5000 --env-file .env staffera-backend
```

#### 2. Run the Vite Web Admin Dashboard
```bash
cd admin-dashboard
docker build -t staffera-admin-dashboard .
docker run -d -p 8080:80 staffera-admin-dashboard
```

#### 3. Setup the Gateway Reverse Proxy (Nginx)
Configure your Nginx service with the optimized [nginx.conf](nginx.conf) included in the root directory to handle SSL termination, WebSockets upgrade handshakes, and route mapping:
```bash
# Copy nginx.conf to your system config and reload
sudo nginx -s reload
```

---

## ⚙️ Environment Variables

Create a `.env` file in `/backend` with the following configuration variables:

```ini
PORT=5000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/staffera?schema=public"
JWT_ACCESS_SECRET="staffera_premium_super_access_secret_2026_key!"
JWT_REFRESH_SECRET="staffera_premium_super_refresh_secret_2026_key!"
REDIS_URL="redis://localhost:6379"
```

---

## 📄 Key Configurations

*   **Reverse Proxy Gateway:** [nginx.conf](nginx.conf)
*   **Node Cluster Manager:** [pm2.config.js](pm2.config.js)
*   **Database Schema Mapping:** [backend/prisma/schema.prisma](backend/prisma/schema.prisma)
*   **System Walkthrough Manual:** Check [walkthrough.md](file:///Users/gorakhkharat/.gemini/antigravity/brain/39537d2a-cae5-4fff-8b40-5edf0c5f82d4/walkthrough.md) in the brain directory for exhaustive architectural descriptions.
