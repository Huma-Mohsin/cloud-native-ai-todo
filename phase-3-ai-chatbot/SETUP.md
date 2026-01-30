# Phase III AI Chatbot - Setup Guide

Complete setup guide for Phase III AI-Powered Chatbot with Better Auth + Google OAuth.

## 🎯 Prerequisites

- Python 3.13+
- Node.js 18+
- PostgreSQL database (Neon Serverless)
- Google Cloud Console account (for OAuth)

---

## 📋 Step-by-Step Setup

### **Step 1: Clone and Navigate**

```bash
cd phase-3-ai-chatbot
```

---

### **Step 2: Backend Setup**

#### 2.1 Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

#### 2.2 Configure Environment Variables

Create `.env` file in `backend/` directory:

```bash
cp .env.example .env
```

Edit `.env` and update:

```env
# Database (your Neon PostgreSQL URL)
DATABASE_URL=postgresql+asyncpg://your-connection-string

# Better Auth Secret (generate a random 32-character string)
BETTER_AUTH_SECRET=your-random-32-character-secret-here

# OpenAI (optional - for real AI responses)
OPENAI_API_KEY=sk-proj-your-key-here
OPENAI_MODEL=gpt-4o
```

**Generate Better Auth Secret:**
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

#### 2.3 Run Database Migrations

```bash
# Run chat tables migration
python run_migration.py

# Run Better Auth tables migration
python run_auth_migration.py
```

---

### **Step 3: Frontend Setup**

#### 3.1 Install Dependencies

```bash
cd ../frontend
npm install
```

#### 3.2 Configure Environment Variables

Create `.env.local` file in `frontend/` directory:

```bash
cp .env.example .env.local
```

Edit `.env.local` and update:

```env
# Database (same as backend)
DATABASE_URL=postgresql://your-connection-string

# Better Auth Secret (MUST match backend secret)
BETTER_AUTH_SECRET=your-random-32-character-secret-here

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3002

# Google OAuth (from Google Cloud Console)
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret

# Backend API
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

### **Step 4: Google OAuth Setup**

#### 4.1 Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable **Google+ API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Application type: **Web application**
6. Authorized redirect URIs:
   ```
   http://localhost:3002/api/auth/callback/google
   ```
7. Copy **Client ID** and **Client Secret**

#### 4.2 Update Frontend .env.local

Paste the credentials:
```env
GOOGLE_CLIENT_ID=your-actual-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-actual-client-secret
```

---

### **Step 5: Run the Application**

#### 5.1 Start Backend (Terminal 1)

```bash
cd backend
python -m uvicorn src.main:app --reload --port 8000
```

Backend will run on: http://localhost:8000

#### 5.2 Start Frontend (Terminal 2)

```bash
cd frontend
npm run dev
```

Frontend will run on: http://localhost:3002

---

## 🎉 Testing the Application

### **1. Open Browser**

Navigate to: http://localhost:3002

### **2. Sign Up / Sign In**

**Option A: Email/Password**
- Click "Sign up"
- Enter name, email, password (min 8 characters)
- Click "Sign Up"

**Option B: Google OAuth**
- Click "Sign in with Google"
- Select your Google account
- Authorize the app

### **3. Use the Chat**

Once logged in, try these commands:
- "Add a task to buy groceries"
- "Show me all my tasks"
- "Mark task 1 as complete"
- "Delete task 2"

---

## 🔧 Troubleshooting

### **Issue: Database connection failed**

**Solution:**
- Verify `DATABASE_URL` is correct in both `.env` files
- Check Neon database is active
- Ensure migrations ran successfully

### **Issue: Google OAuth not working**

**Solution:**
- Verify redirect URI matches exactly: `http://localhost:3002/api/auth/callback/google`
- Check `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are correct
- Ensure Google+ API is enabled in Google Cloud Console

### **Issue: JWT token invalid**

**Solution:**
- Verify `BETTER_AUTH_SECRET` is IDENTICAL in both frontend and backend `.env` files
- Secret must be at least 32 characters
- Restart both servers after changing secrets

### **Issue: CORS errors**

**Solution:**
- Check backend `CORS_ORIGINS` includes `http://localhost:3002`
- Verify frontend is running on port 3002
- Clear browser cache and cookies

---

## 📊 Verification Checklist

- [ ] Backend running on http://localhost:8000
- [ ] Frontend running on http://localhost:3002
- [ ] Database migrations completed (6 tables total)
- [ ] Google OAuth credentials configured
- [ ] Better Auth secrets match in both .env files
- [ ] Can sign up with email/password
- [ ] Can sign in with Google
- [ ] Can send chat messages
- [ ] Can logout successfully

---

## 🚀 Production Deployment

### **Frontend (Vercel)**

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Update Google OAuth redirect URI to production URL
5. Deploy

### **Backend (Railway/Render)**

1. Push code to GitHub
2. Create new service
3. Add environment variables
4. Deploy
5. Update frontend `NEXT_PUBLIC_API_URL` to production backend URL

---

## 📝 Important Notes

1. **Security**: Never commit `.env` or `.env.local` files to git
2. **Secrets**: Generate new secrets for production (don't reuse development secrets)
3. **Database**: Use separate databases for development and production
4. **OAuth**: Add production URLs to Google OAuth authorized redirect URIs

---

## 🆘 Need Help?

- Check backend logs: Terminal 1
- Check frontend logs: Terminal 2 + Browser Console (F12)
- Verify database tables exist in Neon dashboard
- Test API endpoint: http://localhost:8000/docs

---

**Setup Complete! 🎉**

You now have a fully functional AI-powered chatbot with Google OAuth authentication!
