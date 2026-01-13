# Deployment Guide - Phase II Todo Application

This guide covers deploying the frontend to Vercel and backend to Railway/Render.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Database Setup (Neon)](#database-setup)
3. [Backend Deployment (Railway)](#backend-deployment-railway)
4. [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
5. [Alternative: Backend on Render](#alternative-backend-on-render)
6. [Post-Deployment](#post-deployment)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- GitHub account
- Vercel account (free tier)
- Railway account OR Render account (free tier)
- Neon PostgreSQL account (free tier)

---

## Database Setup

### Option 1: Neon (Recommended)

1. **Create Neon Account**
   - Visit https://neon.tech
   - Sign up with GitHub

2. **Create Database**
   ```
   Project Name: todo-app-prod
   Region: Choose closest to your users
   PostgreSQL Version: 16
   ```

3. **Get Connection String**
   - Go to Dashboard → Connection Details
   - Copy the connection string:
   ```
   postgresql://username:password@host/dbname?sslmode=require
   ```

4. **Convert for AsyncPG**
   - Change `postgresql://` to `postgresql+asyncpg://`
   ```
   postgresql+asyncpg://username:password@host/dbname?sslmode=require
   ```

---

## Backend Deployment (Railway)

### Step 1: Prepare Repository

1. **Push code to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

### Step 2: Deploy to Railway

1. **Login to Railway**
   - Visit https://railway.app
   - Sign in with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Select `phase-2-web-app/backend` as root directory

3. **Configure Environment Variables**

   Go to Variables tab and add:

   ```env
   DATABASE_URL=postgresql+asyncpg://...  # Your Neon connection string
   BETTER_AUTH_SECRET=your-random-secret-min-32-chars
   JWT_SECRET=your-random-jwt-secret-min-32-chars
   JWT_EXPIRATION_MINUTES=1440
   CORS_ORIGINS=https://your-frontend-url.vercel.app
   ```

   **Generate Secrets:**
   ```bash
   # Generate random secrets
   python -c "import secrets; print(secrets.token_urlsafe(32))"
   ```

4. **Configure Build**

   Railway should auto-detect the Dockerfile. If not:
   - Go to Settings → Build
   - Dockerfile Path: `Dockerfile`
   - Build Command: (leave empty, uses Dockerfile)

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (~3-5 minutes)

6. **Get Backend URL**
   - Go to Settings → Domains
   - Click "Generate Domain"
   - Copy the URL (e.g., `https://your-app.railway.app`)

### Step 3: Initialize Database

Railway doesn't run migrations automatically. Run them manually:

1. **Option A: Using Railway CLI**
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli

   # Login
   railway login

   # Link project
   railway link

   # Run migrations
   railway run alembic upgrade head
   ```

2. **Option B: Using Python locally**
   ```bash
   # Set DATABASE_URL to production
   export DATABASE_URL=postgresql+asyncpg://...

   # Run migrations
   cd backend
   alembic upgrade head
   ```

---

## Frontend Deployment (Vercel)

### Step 1: Prepare Frontend

1. **Update API URL**

   Edit `vercel.json`:
   ```json
   {
     "rewrites": [
       {
         "source": "/api/:path*",
         "destination": "https://your-backend.railway.app/:path*"
       }
     ]
   }
   ```

2. **Commit changes**
   ```bash
   git add frontend/vercel.json
   git commit -m "Update API URL for production"
   git push
   ```

### Step 2: Deploy to Vercel

1. **Login to Vercel**
   - Visit https://vercel.com
   - Sign in with GitHub

2. **Import Project**
   - Click "Add New..." → "Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js

3. **Configure Project**
   ```
   Framework Preset: Next.js
   Root Directory: phase-2-web-app/frontend
   Build Command: npm run build  (auto-detected)
   Output Directory: .next  (auto-detected)
   Install Command: npm install  (auto-detected)
   ```

4. **Add Environment Variables**

   ```env
   NEXT_PUBLIC_API_URL=https://your-backend.railway.app
   BETTER_AUTH_SECRET=same-as-backend-secret
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait for build (~2-3 minutes)

6. **Get Frontend URL**
   - Copy your Vercel URL (e.g., `https://your-app.vercel.app`)

### Step 3: Update Backend CORS

Go back to Railway and update `CORS_ORIGINS`:

```env
CORS_ORIGINS=https://your-app.vercel.app
```

Redeploy backend for changes to take effect.

---

## Alternative: Backend on Render

### Deploy to Render

1. **Create Account**
   - Visit https://render.com
   - Sign up with GitHub

2. **Create Web Service**
   - New → Web Service
   - Connect repository
   - Configure:
   ```
   Name: todo-backend
   Region: Choose closest
   Branch: main
   Root Directory: phase-2-web-app/backend
   Runtime: Docker
   Dockerfile Path: Dockerfile
   ```

3. **Environment Variables**

   Same as Railway:
   ```env
   DATABASE_URL=postgresql+asyncpg://...
   BETTER_AUTH_SECRET=...
   JWT_SECRET=...
   JWT_EXPIRATION_MINUTES=1440
   CORS_ORIGINS=https://your-frontend.vercel.app
   ```

4. **Deploy**
   - Click "Create Web Service"
   - Get your URL: `https://your-app.onrender.com`

---

## Post-Deployment

### 1. Test the Deployment

**Backend Health Check:**
```bash
curl https://your-backend.railway.app/health
```

**Frontend:**
- Visit your Vercel URL
- Try signup/login
- Create a test task

### 2. Monitor Logs

**Railway:**
- Go to Deployments → View Logs

**Vercel:**
- Go to Deployments → Function Logs

**Render:**
- Go to Logs tab

### 3. Set up Custom Domain (Optional)

**Frontend (Vercel):**
1. Go to Settings → Domains
2. Add custom domain
3. Update DNS records

**Backend (Railway):**
1. Go to Settings → Domains
2. Add custom domain
3. Update DNS records

---

## Troubleshooting

### Backend Issues

**500 Internal Server Error:**
- Check Railway logs for errors
- Verify DATABASE_URL is correct
- Ensure database is accessible

**CORS Errors:**
- Verify `CORS_ORIGINS` includes your Vercel URL
- Check that URL doesn't have trailing slash

**Database Connection Failed:**
- Verify Neon database is active
- Check connection string format
- Ensure SSL mode is set (`?sslmode=require`)

### Frontend Issues

**API Calls Failing:**
- Check `NEXT_PUBLIC_API_URL` is correct
- Verify backend is running
- Check browser console for CORS errors

**Authentication Not Working:**
- Ensure `BETTER_AUTH_SECRET` matches on both frontend and backend
- Check JWT tokens in browser cookies
- Verify backend `/auth/login` endpoint works

**Build Failures:**
- Check Vercel build logs
- Run `npm run build` locally to test
- Verify all dependencies are in `package.json`

### Common Fixes

1. **Clear Build Cache**
   - Vercel: Settings → Clear Cache and Redeploy
   - Railway: Redeploy from scratch

2. **Check Environment Variables**
   ```bash
   # Railway CLI
   railway variables

   # Vercel CLI
   vercel env ls
   ```

3. **View Logs**
   ```bash
   # Railway
   railway logs

   # Vercel
   vercel logs
   ```

---

## Useful Commands

### Railway CLI

```bash
# Install
npm install -g @railway/cli

# Login
railway login

# Link project
railway link

# View logs
railway logs

# Run command
railway run <command>

# Open dashboard
railway open
```

### Vercel CLI

```bash
# Install
npm install -g vercel

# Deploy
vercel

# Production deploy
vercel --prod

# View logs
vercel logs

# Environment variables
vercel env pull
```

---

## Security Checklist

- [ ] Changed all default secrets
- [ ] DATABASE_URL uses SSL (`?sslmode=require`)
- [ ] CORS restricted to specific origins (no wildcards)
- [ ] JWT secrets are strong (32+ characters)
- [ ] Environment variables not committed to Git
- [ ] HTTPS enabled on all services
- [ ] Database has strong password
- [ ] Monitoring/alerts configured

---

## Cost Estimate (Free Tiers)

- **Neon Database**: Free (500MB storage, 1 project)
- **Railway**: Free ($5 credit/month, ~500 hours)
- **Vercel**: Free (100GB bandwidth, unlimited projects)
- **Total**: $0/month (within free tier limits)

---

## Next Steps After Deployment

1. Set up monitoring (Sentry, LogRocket)
2. Configure analytics (Google Analytics, Plausible)
3. Add status page (status.io)
4. Set up backups for database
5. Configure CI/CD for automated deployments

---

**Deployment Complete!** 🎉

Your Phase II Todo Application is now live and accessible to users worldwide.
