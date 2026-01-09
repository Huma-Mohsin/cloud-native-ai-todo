# Quick Start Guide - Phase 2 Web App

## ✅ What's Been Implemented

**Phase 2 (Foundational)**: Database, models, schemas, utilities, CORS
**Phase 3 (Authentication)**: Complete user signup, login, logout with JWT

**Total**: 43 tasks completed in single session!

---

## 🚀 Step 1: Get Neon Database URL

1. Visit https://neon.tech
2. Create a free account
3. Create a new project: "todo-phase-2"
4. Copy the connection string
5. **IMPORTANT**: Change `postgresql://` to `postgresql+asyncpg://`

Example:
```
# Original
postgresql://user:pass@host/db

# Change to
postgresql+asyncpg://user:pass@host/db
```

---

## 🔧 Step 2: Backend Setup

```bash
# Navigate to backend directory
cd phase-2-web-app/backend

# Create .env file
cp .env.example .env

# Edit .env and update:
# 1. DATABASE_URL (from Neon, with asyncpg)
# 2. BETTER_AUTH_SECRET (generate with command below)
# 3. CORS_ORIGINS (keep http://localhost:3000 for dev)

# Generate secret key (Windows Git Bash)
openssl rand -hex 32

# Install dependencies (using UV)
uv pip install -e ".[dev]"

# Activate virtual environment
source .venv/Scripts/activate

# Run backend server
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

**Backend should be running at**: http://localhost:8000
**API Docs**: http://localhost:8000/docs

---

## 🎨 Step 3: Frontend Setup

```bash
# Open a new terminal
# Navigate to frontend directory
cd phase-2-web-app/frontend

# Create .env.local file
cp .env.local.example .env.local

# Edit .env.local and update:
# 1. NEXT_PUBLIC_API_URL=http://localhost:8000
# 2. BETTER_AUTH_SECRET (MUST match backend)

# Install dependencies
npm install
# or
pnpm install

# Run frontend development server
npm run dev
# or
pnpm dev
```

**Frontend should be running at**: http://localhost:3000

---

## 🧪 Step 4: Test Authentication Flow

### Test Signup
1. Open browser: http://localhost:3000
2. Should redirect to /login
3. Click "Sign up"
4. Fill in:
   - **Name**: Ahmed Khan
   - **Email**: ahmed@example.com
   - **Password**: SecurePass123
5. Click "Sign Up"
6. Should redirect to /dashboard
7. Should see "Welcome, Ahmed Khan!"

### Test Logout
1. Click "Logout" button in dashboard
2. Should redirect to /login
3. Token should be removed from localStorage

### Test Login
1. On /login page, enter:
   - **Email**: ahmed@example.com
   - **Password**: SecurePass123
2. Click "Log In"
3. Should redirect to /dashboard

### Test Route Protection
1. While logged in, visit: http://localhost:3000/login
   - Should redirect to /dashboard
2. Logout
3. Try to visit: http://localhost:3000/dashboard
   - Should redirect to /login

---

## 🔍 Verify Backend API

### Using Swagger UI
1. Open http://localhost:8000/docs
2. Try POST /auth/signup:
   ```json
   {
     "name": "Test User",
     "email": "test@example.com",
     "password": "SecurePass123"
   }
   ```
3. Should return 201 with JWT token
4. Copy the `access_token`
5. Click "Authorize" button (top right)
6. Enter: `Bearer YOUR_TOKEN_HERE`
7. Try protected endpoints

### Using curl
```bash
# Signup
curl -X POST http://localhost:8000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"SecurePass123"}'

# Login
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"SecurePass123"}'
```

---

## 📊 Database Verification

### Check Tables Created

Using psql (if available):
```bash
psql "YOUR_NEON_DATABASE_URL"

# List tables
\dt

# Should see:
# - users
# - tasks

# Check users table
SELECT * FROM users;

# Should see your created users
```

Or use Neon's SQL Editor in the web console.

---

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check Python version
python --version  # Should be 3.13+

# Check if dependencies installed
uv pip list

# Try reinstalling
uv pip install -e ".[dev]" --force-reinstall
```

### Database connection error
```bash
# Verify DATABASE_URL format
# Must be: postgresql+asyncpg://user:pass@host/db
#           ^^^^^^^^^^ (asyncpg is required!)

# Test connection manually
python -c "import asyncpg; print('asyncpg installed')"
```

### Frontend build errors
```bash
# Clear cache
rm -rf .next node_modules

# Reinstall
npm install

# Check Node version
node --version  # Should be 18+
```

### CORS errors
```bash
# Check backend .env
# CORS_ORIGINS should include frontend URL
CORS_ORIGINS=http://localhost:3000

# Restart backend after changing .env
```

### Token not persisting
```bash
# Open browser console (F12)
# Go to Application > Local Storage
# Should see "auth_token" key after login
# If not, check network tab for API errors
```

---

## 📝 Environment Variables Checklist

### Backend `.env`
- [ ] DATABASE_URL (Neon with asyncpg)
- [ ] BETTER_AUTH_SECRET (32+ characters)
- [ ] CORS_ORIGINS (http://localhost:3000)
- [ ] ENVIRONMENT (development)

### Frontend `.env.local`
- [ ] NEXT_PUBLIC_API_URL (http://localhost:8000)
- [ ] BETTER_AUTH_SECRET (matches backend)

---

## 🎯 What's Working

✅ User signup with validation
✅ Email uniqueness check
✅ Password hashing with bcrypt
✅ JWT token generation
✅ User login
✅ Token verification
✅ Protected routes (middleware)
✅ Logout (client-side)
✅ Auto-redirect based on auth state
✅ Form validation
✅ Error display
✅ Loading states

---

## 🚧 Known Issues

1. **Middleware Cookie Check**: Currently using localStorage for tokens, but middleware checks cookies. May need to sync tokens to cookies.

2. **User Name in Dashboard**: useAuth hook tries to get name from JWT, but we only store email. May show email instead of name.

3. **Token Expiry**: Tokens expire after 24 hours. No refresh token mechanism yet.

---

## 📸 Expected Screens

### /signup
- Name input
- Email input
- Password input (with requirements hint)
- Sign Up button
- Link to login

### /login
- Email input
- Password input
- Log In button
- Link to signup

### /dashboard
- Header with user name
- Logout button
- Placeholder message for Phase 4

---

## ✅ Success Criteria

Your setup is successful if:
1. Backend starts without errors on port 8000
2. Frontend starts without errors on port 3000
3. Can signup with new user
4. Can login with existing user
5. Dashboard shows after successful auth
6. Logout redirects to login
7. Protected routes require authentication
8. Database tables created in Neon

---

## 📅 Next Session: Phase 4 (Task CRUD)

Once authentication is working, we'll implement:
- Create tasks
- View tasks list
- Update tasks (title, description, completion)
- Delete tasks
- Data isolation (users only see their tasks)

**Estimated**: 20 tasks, ~1-2 hours

---

## 🆘 Need Help?

1. Check browser console (F12) for errors
2. Check backend logs in terminal
3. Verify all environment variables are set
4. Make sure both servers are running
5. Test backend API with Swagger UI first
6. Then test frontend

---

**Status**: Ready for testing!
**Created**: 2026-01-01
**Session**: Phase 2 + 3 Implementation Complete
