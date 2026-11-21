# ANTAH Production Deployment Guide

This document provides complete, step-by-step instructions for deploying the **ANTAH** platform (The Unheard Signals Network) to production.

---

## 1. System Architecture Overview

ANTAH is structured as a decoupled full-stack civic intelligence platform:

| Component | Technology | Recommended Production Host | Purpose |
| :--- | :--- | :--- | :--- |
| **Frontend** | React 18, Vite 5, TailwindCSS, Lucide, Nexconn Web SDK | **Vercel** (Global Edge CDN) | Citizen portal, incident map, community chat rooms, civic reporter |
| **Backend** | Python 3.12, FastAPI, SQLAlchemy 2.0, Uvicorn, Pydantic v2 | **Render**, **Railway**, **Fly.io**, or **Docker/AWS App Runner** | REST API, Nexconn token signing, JWT auth, incident clustering, AI services |
| **Database** | PostgreSQL 16+ (or Neon Serverless Postgres) | **Neon.tech** or **Supabase** | Multi-table persistent storage with auto-schema migration and pooling |
| **Media Storage** | Local Disk / AWS S3 / Cloudflare R2 / Supabase Storage | **Cloudflare R2** or **AWS S3** | Persistent evidence photographs uploaded by citizens |
| **Realtime Chat** | Nexconn RTC & Channel System | **Nexconn Cloud** | High-throughput low-latency citizen and coordinator chat channels |
| **Civic AI** | OpenRouter (LLaMA 3.3 70B Instruct / Claude 3.5 Sonnet) | **OpenRouter API** | Citizen guidance on civic hazards grounded on live database records |

---

## 2. Frontend Deployment to Vercel

The frontend is a Single Page Application (SPA) built with Vite and React Router.

### Vercel Deployment Options

#### Option A: Deploy from GitHub (Recommended)
1. Push your repository to GitHub.
2. Log in to [Vercel](https://vercel.com) and click **"Add New..." > "Project"**.
3. Import your `Nexconn_Innovengers-main` repository.
4. In the Project Configuration screen:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend` *(or leave blank if deploying root; the root `vercel.json` will automatically build the `frontend` subdirectory)*
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Expand the **Environment Variables** section and configure the variables listed in [Section 6](#6-environment-variables-reference).
6. Click **Deploy**.

#### Option B: Deploy via Vercel CLI
```bash
# Navigate to frontend
cd frontend

# Deploy preview
npx vercel

# Deploy production
npx vercel --prod
```

### SPA Routing & Clean URLs
Both `frontend/vercel.json` and the root `vercel.json` include SPA rewrite rules:
```json
{
  "cleanUrls": true,
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```
This guarantees that deep route refreshes (e.g. `/explorer`, `/messages`, `/report`, `/dashboard`) do not produce HTTP 404 errors.

---

## 3. Backend Deployment

FastAPI requires a persistent server runtime for long-running connections, background event loops, and file streaming. It should be hosted on a persistent container or web service (Render, Railway, Fly.io, or Docker).

### Option A: Render 1-Click Blueprint (Recommended)
The project includes a ready-to-use [`render.yaml`](file:///c:/Users/Raj/Desktop/Nexconn_Innovengers-main/render.yaml) blueprint:
1. Push your repository to GitHub.
2. In [Render Dashboard](https://dashboard.render.com), select **"Blueprints"** > **"New Blueprint Instance"**.
3. Select your repository. Render automatically reads `render.yaml` and provisions:
   - Python 3.12 Web Service (`antah-backend`)
   - Auto-generated `JWT_SECRET`
   - Health check path `/api/v1/health`
4. Fill in the required secret environment variables (`DATABASE_URL`, `NEXCONN_APP_ID`, `NEXCONN_APP_KEY`, `NEXCONN_APP_SECRET`, `AI_API_KEY`).
5. Render deploys the service and provides your live backend URL (e.g., `https://antah-backend.onrender.com`).

### Option B: Railway / Fly.io / Docker
The repository includes a production-hardened [`backend/Dockerfile`](file:///c:/Users/Raj/Desktop/Nexconn_Innovengers-main/backend/Dockerfile):
```bash
# Build the Docker image
docker build -t antah-backend:latest -f backend/Dockerfile backend/

# Run the container locally or on a cloud VM
docker run -d -p 8000:8000 \
  --env-file backend/.env \
  -v antah_uploads:/app/uploads \
  --name antah-api antah-backend:latest
```

---

## 4. PostgreSQL Database Configuration

### Connection String Format
ANTAH uses SQLAlchemy 2.0 with the pure-python `pg8000` driver for zero-binary-dependency execution on both Linux containers and Windows.

Your `DATABASE_URL` should follow this format:
```
postgresql+pg8000://<username>:<password>@<host>:<port>/<dbname>?sslmode=require
```

> **Automatic Driver Normalization**: If your cloud provider (e.g., Neon, Render, Supabase, Heroku) gives you a URL starting with `postgres://` or `postgresql://`, the ANTAH database module ([`backend/app/db.py`](file:///c:/Users/Raj/Desktop/Nexconn_Innovengers-main/backend/app/db.py)) automatically normalizes it to `postgresql+pg8000://` on startup.

### Connection Pooling & SSL
In [`backend/app/db.py`](file:///c:/Users/Raj/Desktop/Nexconn_Innovengers-main/backend/app/db.py), the engine is configured with:
- `pool_size=10`
- `max_overflow=20`
- `pool_pre_ping=True` (verifies connections before checkout, preventing stale socket errors)
- `pool_recycle=280` (recycles connections prior to serverless idle disconnections)
- `ssl_context=ssl.create_default_context()` for encrypted transit.

### Automatic Schema Synchronization
When starting in production, `init_db()` invokes `_ensure_schema_migrations()`. This detects existing tables and automatically adds missing columns without deleting existing tables or user records.

---

## 5. Persistent Cloud Image Storage

In containerized or ephemeral production environments (Render, Fly.io, Kubernetes), local disk storage is reset on each deployment or restart.

ANTAH includes a unified cloud storage adapter ([`backend/app/services/storage.py`](file:///c:/Users/Raj/Desktop/Nexconn_Innovengers-main/backend/app/services/storage.py)) supporting **Cloudflare R2**, **AWS S3**, **Supabase Storage**, or persistent local disk.

### Configuring Cloudflare R2 / AWS S3
Set the following environment variables on the backend:
```env
AWS_STORAGE_BUCKET_NAME=antah-evidence
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AWS_REGION=auto
# For Cloudflare R2:
S3_ENDPOINT_URL=https://<account_id>.r2.cloudflarestorage.com
# For Public Image Access:
STORAGE_PUBLIC_URL=https://cdn.yourdomain.com
```

If these variables are omitted, ANTAH seamlessly falls back to saving files in `uploads/reports/` with local static serving at `/api/v1/uploads/reports/{filename}`.

---

## 6. Environment Variables Reference

### Frontend Variables (Vercel)
Configure these in the **Vercel Project Settings > Environment Variables**:

| Variable Name | Required | Default / Example | Purpose |
| :--- | :---: | :--- | :--- |
| `VITE_API_BASE_URL` | **Yes** | `https://antah-backend.onrender.com/api/v1` | Production URL pointing to your deployed backend API gateway. |
| `VITE_NEXCONN_APP_KEY` | **Yes** | `qf3d5gbjqvk3h` | Nexconn Chat App Key for client SDK room subscriptions. |
| `VITE_NEXCONN_AREA_CODE` | **Yes** | `2` | Nexconn geographic cluster code (2 = Singapore/Asia). |
| `VITE_CARTO_API_KEY` | No | *(leave blank for default basemap)* | CartoDB map tile key for dark civic map tiles. |

### Backend Variables (Render / Railway / Docker)
Configure these in your backend hosting environment:

| Variable Name | Required | Example | Purpose |
| :--- | :---: | :--- | :--- |
| `DATABASE_URL` | **Yes** | `postgresql+pg8000://user:pass@ep-pooler.aws.neon.tech/neondb` | Production PostgreSQL connection string. |
| `JWT_SECRET` | **Yes** | `a-minimum-32-char-random-production-key` | Cryptographic secret for signing citizen auth tokens. |
| `ENVIRONMENT` | **Yes** | `production` | Enables production error handling and security headers. |
| `CORS_ORIGINS` | **Yes** | `https://antah.vercel.app,https://*.vercel.app` | Comma-separated list of allowed frontend domains. |
| `NEXCONN_APP_ID` | **Yes** | `qf3d5gbjqvk3h` | Nexconn App ID for backend token signing. |
| `NEXCONN_APP_KEY` | **Yes** | `qf3d5gbjqvk3h` | Nexconn App Key. |
| `NEXCONN_APP_SECRET` | **Yes** | `tkswtS6V24zAXL` | Nexconn App Secret (keep private!). |
| `NEXCONN_API_BASE_URL` | **Yes** | `https://api.sg-light-api.com` | Nexconn REST API gateway. |
| `NEXCONN_AREA_CODE` | **Yes** | `2` | Nexconn cluster region identifier. |
| `AI_PROVIDER` | No | `openrouter` | AI engine provider. |
| `AI_API_KEY` | **Yes** | `sk-or-v1-...` | OpenRouter API Key for Civic Intelligence Assistant. |
| `AI_MODEL` | No | `openrouter/auto` | Primary LLM model identifier. |
| `AWS_STORAGE_BUCKET_NAME` | Optional | `antah-evidence` | S3 / R2 Bucket name for photo evidence storage. |
| `AWS_ACCESS_KEY_ID` | Optional | `AKIA...` | S3 / R2 Access Key. |
| `AWS_SECRET_ACCESS_KEY` | Optional | `secret...` | S3 / R2 Secret Key. |
| `S3_ENDPOINT_URL` | Optional | `https://<id>.r2.cloudflarestorage.com` | Custom endpoint for Cloudflare R2 / MinIO. |
| `STORAGE_PUBLIC_URL` | Optional | `https://cdn.yourdomain.com` | Public CDN URL for evidence photos. |

---

## 7. CORS Security Configuration

In [`backend/app/main.py`](file:///c:/Users/Raj/Desktop/Nexconn_Innovengers-main/backend/app/main.py), the `CORSMiddleware` is configured to allow:
- Your explicit production Vercel domain (`https://antah.vercel.app`)
- Preview deployments on Vercel (`https://*.vercel.app`)
- The Android WebView origin (`https://appassets.androidplatform.net`)
- Local development origins (`http://localhost:5173`, `http://127.0.0.1:5173`)

To restrict origins further in production, specify your domains in the `CORS_ORIGINS` environment variable on your backend.

---

## 8. Post-Deployment Verification Checklist

Once both frontend and backend are deployed, execute these validation steps:

### 1. Health & Database Check
```bash
curl -i https://<your-backend-url>/api/v1/health
```
**Expected response**:
```json
{
  "status": "healthy",
  "service": "ANTAH Core API",
  "version": "1.0.0",
  "database": {
    "status": "connected",
    "dialect": "postgresql",
    "latency_ms": 42.15
  }
}
```

### 2. User Authentication & Registration
1. Open your Vercel frontend URL: `https://<your-project>.vercel.app`
2. Register a new citizen account with a name, email, and password.
3. Verify that:
   - The user is redirected to the home dashboard.
   - The user's role is correctly recognized as `reporter`.
   - Logging out and logging back in issues a valid JWT access token.

### 3. Report Submission & Evidence Photograph Upload
1. Navigate to `/report` on your Vercel app.
2. Fill out title, category (e.g. Infrastructure), location, and urgency.
3. Attach an evidence image (JPEG/PNG).
4. Click **Submit Report**.
5. Verify the report appears in `/explorer` with the uploaded image loaded properly from the storage URL.

### 4. Nexconn Real-Time Community Chat
1. Open `/messages` on your Vercel app.
2. Select an incident channel or the **General Civic Discussion** room.
3. Confirm that the room loads and that real-time chat messages can be sent and received.

### 5. ANTAH Civic Intelligence (AI Assistant)
1. In the chat interface, query the AI Assistant:
   > *"What is the status of active civic hazard reports in the area?"*
2. Verify the AI generates a response contextualized with live database reports.

---

## 9. Automated Production Pipeline Test Script

You can run the included automated verification script against your production backend at any time:

```bash
# Set target gateway to your production backend
export BASE_URL="https://<your-backend-url>/api/v1"

# Run automated test suite
python scripts/verify_production_pipeline.py
```
This script exercises:
- Health & DB connection
- Citizen registration & login
- Report submission
- Multipart evidence photo upload
- Nexconn token generation
- OpenRouter AI contextual Q&A
