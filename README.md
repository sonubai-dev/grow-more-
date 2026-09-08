# ZellonAI - Smart Customer Feedback & Google Review Management Platform

ZellonAI is an enterprise-grade customer feedback routing and reputation management platform built for local and multi-location businesses. It intelligently channels positive customer reviews directly to Google Reviews while capturing private, constructive feedback to protect online reputation.

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Local Setup](#local-setup)
4. [Firebase Setup](#firebase-setup)
5. [Environment Variables](#environment-variables)
6. [Development Commands](#development-commands)
7. [Production Build](#production-build)
8. [Netlify Deployment](#netlify-deployment)
9. [Firestore Rules Deployment](#firestore-rules-deployment)
10. [Firebase Storage Rules](#firebase-storage-rules)
11. [Firebase Authentication Setup](#firebase-authentication-setup)

---

## 1. Project Overview

ZellonAI provides a complete review acceleration and reputation suite:
- **Intelligent Feedback Routing**: 5-star ratings redirect seamlessly to the business's official Google Reviews URL; constructive ratings (1-4 stars) are captured in a private feedback inbox.
- **Tenant Management**: Multi-business management with custom slug URLs (`/r/:slug`), customizable branding, logos, threshold configurations, and SMS/Email invite templates.
- **Analytics & Conversion Tracking**: Real-time monitoring of customer submissions, Google redirect conversions, NPS breakdown, and monthly review volume.
- **Authoritative Admin Console**: Platform-level tenant directory (`/admin/businesses`), global review moderation stream (`/admin/feedback`), and system parameters (`/admin/settings`).

---

## 2. Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Lucide React Icons, Motion animations
- **Backend & Database**: Firebase Firestore (NoSQL), Firebase Authentication, Firebase Storage
- **Charts & Visualization**: Recharts, D3
- **Hosting / CDN**: Netlify (or Firebase Hosting)

---

## 3. Local Setup

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm or yarn or bun

### Step 1: Clone the repository
```bash
git clone https://github.com/your-username/reviewflow.git
cd reviewflow
```

### Step 2: Install dependencies
```bash
npm install
```

### Step 3: Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Fill in your Firebase credentials in `.env.local`.

### Step 4: Start local development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) (or the Vite dev port) in your browser.

---

## 4. Firebase Setup

1. Go to the [Firebase Console](https://console.firebase.google.com/) and click **Add Project**.
2. Name your project (e.g., `reviewflow-production`).
3. Enable **Cloud Firestore** in Production mode.
4. Enable **Firebase Authentication** and **Firebase Storage**.
5. In **Project Settings** > **General**, click the **Web app** icon (`</>`) to register your web application.
6. Copy the `firebaseConfig` keys into your `.env.local` or deployment platform environment variables.

---

## 5. Environment Variables

Create `.env.local` (or configure in Netlify dashboard) with the following parameters:

| Variable Name | Required | Description |
| :--- | :--- | :--- |
| `VITE_FIREBASE_API_KEY` | **Yes** | Web API Key from Firebase Console |
| `VITE_FIREBASE_AUTH_DOMAIN` | **Yes** | Auth domain (`<project-id>.firebaseapp.com`) |
| `VITE_FIREBASE_PROJECT_ID` | **Yes** | Firebase Project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | **Yes** | Cloud Storage Bucket URL |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | **Yes** | Sender ID from Firebase Console |
| `VITE_FIREBASE_APP_ID` | **Yes** | Web App ID (`1:xxx:web:xxx`) |
| `VITE_GOOGLE_MAPS_API_KEY` | No | Optional Google Maps API Key for place lookup |

---

## 6. Development Commands

```bash
# Start development server
npm run dev

# Run TypeScript type check
npm run lint

# Compile production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## 7. Production Build

To test and verify the production bundle locally:

```bash
npm run build
```

This compiles optimized client-side assets into the `dist/` directory with source-maps, asset hashing, and minification.

---

## 8. Netlify Deployment

### Method A: Connect with Git (Recommended)
1. Push your code to GitHub / GitLab.
2. In [Netlify](https://app.netlify.com/), click **Add new site** > **Import an existing project**.
3. Select your Git repository.
4. Set Build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
5. Go to **Site Configuration** > **Environment variables** and add the `VITE_FIREBASE_*` variables from `.env.example`.
6. Click **Deploy Site**.

### SPA Routing & Redirects
The project includes `netlify.toml` and `public/_redirects` configuring `/* -> /index.html (200)` so direct URLs like `/dashboard`, `/login`, and `/r/business-name` reload seamlessly without 404 errors.

---

## 9. Firestore Rules Deployment

Deploy the hardened rules contained in `firestore.rules`:

### Using Firebase CLI:
```bash
npm install -g firebase-tools
firebase login
firebase use --add <your-firebase-project-id>
firebase deploy --only firestore:rules
```

### Manual Console Deployment:
1. Open [Firebase Console](https://console.firebase.google.com/) > **Firestore Database** > **Rules**.
2. Paste the contents of `firestore.rules`.
3. Click **Publish**.

---

## 10. Firebase Storage Rules

Deploy the storage security rules contained in `storage.rules`:

### Using Firebase CLI:
```bash
firebase deploy --only storage
```

### Manual Console Deployment:
1. Open [Firebase Console](https://console.firebase.google.com/) > **Storage** > **Rules**.
2. Paste the contents of `storage.rules`.
3. Click **Publish**.

---

## 11. Firebase Authentication Setup

1. In the **Firebase Console**, navigate to **Build** > **Authentication** > **Sign-in method**.
2. Enable **Email/Password**.
3. Enable **Google** sign-in (configure support email and consent screen).
4. Under **Authorized domains**, add:
   - `localhost`
   - Your Netlify domain (e.g. `your-app.netlify.app`)
   - Any custom domain (e.g. `app.yourdomain.com`)

---

## License
Proprietary & Confidential. All rights reserved.
