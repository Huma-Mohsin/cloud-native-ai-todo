# 🚀 Deployment Guide - Phase II Web App

**Quick Deploy**: Frontend (Vercel) + Backend (Railway) in 15 minutes!

---

## 📋 Pre-Deployment Checklist

- ✅ Code working locally
- ✅ Backend `.env` configured
- ✅ Frontend `.env.local` configured
- ✅ GitHub repository ready
- ✅ Neon database URL ready

---

## 🎯 Deployment Strategy

**Frontend**: Vercel (Free, auto-deploys from GitHub)
**Backend**: Railway (Free tier, easy setup)
**Database**: Neon (Already configured)

**Total Time**: ~15 minutes

---

## 1️⃣ Deploy Frontend to Vercel

### Step 1: Push to GitHub (if not already)

```bash
cd phase-2-web-app/frontend
git add .
git commit -m "feat: prepare frontend for deployment"
git push origin main
```

### Step 2: Deploy to Vercel

**Option A: Via Web (Easiest)**

1. Go to https://vercel.com
2. Click "Add New Project"
3. Import your GitHub repository
4. Select `phase-2-web-app/frontend` as root directory
5. Add environment variables:
   - `NEXT_PUBLIC_API_URL` = `https://your-backend-url.railway.app`
   - `BETTER_AUTH_SECRET` = (same as backend)
6. Click "Deploy"
7. ✅ Done! Get URL: `https://your-app.vercel.app`

**Option B: Via CLI**

```bash
# Install Vercel CLI
npm i -g vercel

# In frontend directory
cd phase-2-web-app/frontend

# Deploy
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name? phase-2-todo-app
# - Root directory? ./
# - Override settings? No

# Add environment variables
vercel env add NEXT_PUBLIC_API_URL
# Enter: https://your-backend-url.railway.app

vercel env add BETTER_AUTH_SECRET
# Enter: your-secret-key

# Deploy to production
vercel --prod
```

---

## 2️⃣ Deploy Backend to Railway

### Step 1: Prepare Backend

**Create `railway.json`** (if needed):

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "uvicorn src.main:app --host 0.0.0.0 --port $PORT",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 100
  }
}
```

**Create `Procfile`**:

```
web: uvicorn src.main:app --host 0.0.0.0 --port $PORT
```

**Update `pyproject.toml`** (ensure python version):

```toml
[tool.poetry]
name = "todo-backend"
version = "2.0.0"

[tool.poetry.dependencies]
python = "^3.13"
fastapi = "^0.128.0"
uvicorn = "^0.30.0"
sqlalchemy = "^2.0.0"
sqlmodel = "^0.0.14"
asyncpg = "^0.29.0"
pydantic = "^2.0.0"
pydantic-settings = "^2.0.0"
python-jose = {extras = ["cryptography"], version = "^3.3.0"}
passlib = {extras = ["bcrypt"], version = "^1.7.4"}
python-multipart = "^0.0.6"
```

### Step 2: Deploy to Railway

**Option A: Via Web (Recommended)**

1. Go to https://railway.app
2. Sign up/Login with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose your repository
6. Select service root: `phase-2-web-app/backend`
7. Railway auto-detects Python app
8. Add environment variables:
   - `DATABASE_URL` = (your Neon connection string)
   - `BETTER_AUTH_SECRET` = (same as frontend)
   - `CORS_ORIGINS` = `https://your-app.vercel.app`
   - `ENVIRONMENT` = `production`
9. Click "Deploy"
10. ✅ Done! Get URL: `https://your-backend.railway.app`

**Option B: Via CLI**

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# In backend directory
cd phase-2-web-app/backend

# Initialize
railway init

# Link project
railway link

# Add environment variables
railway variables set DATABASE_URL="your-neon-url"
railway variables set BETTER_AUTH_SECRET="your-secret"
railway variables set CORS_ORIGINS="https://your-app.vercel.app"
railway variables set ENVIRONMENT="production"

# Deploy
railway up

# Get URL
railway domain
```

### Step 3: Update Frontend ENV

After backend deploys, update Vercel environment variable:

```bash
# In Vercel dashboard
NEXT_PUBLIC_API_URL = https://your-backend.railway.app

# Or via CLI
vercel env rm NEXT_PUBLIC_API_URL production
vercel env add NEXT_PUBLIC_API_URL production
# Enter: https://your-backend.railway.app

# Redeploy
vercel --prod
```

---

## 3️⃣ Alternative: Deploy Backend to Render

**If Railway doesn't work, use Render:**

1. Go to https://render.com
2. Click "New Web Service"
3. Connect GitHub repository
4. Configure:
   - **Name**: `todo-backend`
   - **Root Directory**: `phase-2-web-app/backend`
   - **Runtime**: Python 3
   - **Build Command**: `pip install -e .`
   - **Start Command**: `uvicorn src.main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables (same as Railway)
6. Click "Create Web Service"
7. ✅ Done! Get URL: `https://todo-backend.onrender.com`

---

## 4️⃣ Verify Deployment

### Test Backend

```bash
# Health check
curl https://your-backend.railway.app/health

# Should return:
# {"status":"healthy","environment":"production","version":"2.0.0"}

# Test docs
# Open: https://your-backend.railway.app/docs
```

### Test Frontend

```bash
# Open browser
https://your-app.vercel.app

# Test:
1. Sign up with new account
2. Create task
3. Mark as complete
4. Delete task
5. ✅ All working!
```

### Test Integration

```bash
# In browser console
localStorage.getItem('token')
# Should show JWT token

# Check API calls in Network tab
# Should see requests to Railway backend
```

---

## 5️⃣ Update CORS

**Backend needs to allow frontend domain:**

Update backend `.env` or Railway variables:

```bash
CORS_ORIGINS=https://your-app.vercel.app,https://your-app-*.vercel.app
```

Redeploy backend:
```bash
railway up
# or in Render dashboard, trigger redeploy
```

---

## 6️⃣ Make Repository Public

```bash
# On GitHub
1. Go to repository settings
2. Scroll to "Danger Zone"
3. Click "Change visibility"
4. Select "Make public"
5. Confirm
```

---

## 7️⃣ Get Submission URLs

Add to your submission form:

```
Frontend URL: https://your-app.vercel.app
Backend URL: https://your-backend.railway.app
Backend Docs: https://your-backend.railway.app/docs
GitHub Repo: https://github.com/yourusername/repo-name
```

---

## 🐛 Troubleshooting

### Frontend Issues

**Build fails:**
```bash
# Check Node version
node -v  # Should be 18+

# Clear cache
rm -rf .next node_modules
npm install
npm run build
```

**Environment variables not working:**
```bash
# Must start with NEXT_PUBLIC_ for client-side
NEXT_PUBLIC_API_URL=https://...

# Redeploy after changing env vars
vercel --prod
```

### Backend Issues

**Database connection fails:**
```bash
# Check DATABASE_URL format
postgresql+asyncpg://user:pass@host:5432/db?sslmode=require

# Test connection
python -c "from src.database import engine; print('OK')"
```

**Import errors:**
```bash
# Check pyproject.toml has all dependencies
# Railway should auto-install from pyproject.toml
```

**Port binding:**
```bash
# Railway provides $PORT variable
# Make sure: --port $PORT in start command
```

### CORS Issues

**Frontend can't connect:**
```bash
# Check CORS_ORIGINS includes frontend URL
# Format: https://app.vercel.app (no trailing slash)

# Check browser console for CORS errors
```

---

## 📊 Cost Breakdown

**Free Tier (Good for submission):**

| Service | Free Tier | Limits |
|---------|-----------|--------|
| Vercel | ✅ Free | Unlimited deployments |
| Railway | ✅ $5 credit/month | ~500 hours |
| Render | ✅ Free | 750 hours/month |
| Neon | ✅ Free | 3 projects, 0.5GB storage |

**Total**: $0/month for Phase II! 🎉

---

## ⚡ Quick Commands Summary

```bash
# Deploy Frontend (Vercel)
cd phase-2-web-app/frontend
vercel --prod

# Deploy Backend (Railway)
cd phase-2-web-app/backend
railway up

# Check health
curl https://your-backend.railway.app/health

# Test frontend
open https://your-app.vercel.app
```

---

## 📝 Post-Deployment Checklist

- [ ] Frontend deployed and accessible
- [ ] Backend deployed and accessible
- [ ] Backend `/docs` working
- [ ] Health check returns 200
- [ ] Can signup new user
- [ ] Can create tasks
- [ ] Can update tasks
- [ ] Can delete tasks
- [ ] Data persists in Neon database
- [ ] GitHub repository is public
- [ ] URLs collected for submission

---

## 🎥 Demo Video Script

**Record 90-second video showing:**

1. **[0-15s]** Open frontend URL, show UI
2. **[15-30s]** Signup → Create account
3. **[30-45s]** Create task with title/description
4. **[45-60s]** Mark task complete → Edit task
5. **[60-75s]** Delete task → Show empty state
6. **[75-90s]** Show backend docs, highlight features

**Upload to YouTube as unlisted**

---

## ✅ Success!

Your app is now **deployed and public**! 🚀

**Next Steps:**
1. ✅ Get deployment URLs
2. ✅ Record demo video
3. ✅ Submit to hackathon
4. ✅ (Optional) Add tests later

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)
Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
