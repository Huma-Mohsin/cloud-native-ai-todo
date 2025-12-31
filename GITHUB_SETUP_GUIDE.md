# GitHub Repository Setup Guide

## Quick Setup (5 minutes)

### Step 1: Create GitHub Repository

1. Go to: **https://github.com/new**

2. Fill in the repository details:
   - **Repository name**: `todo-app-hackathon-ii`
   - **Description**: `Todo App - Hackathon II: Spec-Driven Development (Phase I + Reusable Intelligence)`
   - **Visibility**: ✅ **Public** (required for submission)
   - **Initialize**: ❌ **DO NOT** check "Add README" (we already have one)
   - **Add .gitignore**: ❌ **None** (we already have one)
   - **License**: ❌ **None** (or choose MIT if you prefer)

3. Click **"Create repository"**

### Step 2: Push Your Code

After creating the repository, GitHub will show you commands. **Use these exact commands**:

```bash
# Navigate to your project
cd "C:\Users\Huma Aftab\OneDrive\Documents\Gemini_cli_practice_q4\cloud-native-ai-todo-Hackathon2\my-app"

# Add the remote (replace USERNAME with your GitHub username)
git remote add origin https://github.com/Huma-Mohsin/todo-app-hackathon-ii.git

# Verify remote was added
git remote -v

# Push your code
git push -u origin master
```

**Note**: Replace `Huma-Mohsin` with your actual GitHub username if different.

### Step 3: Verify Upload

1. Go to: `https://github.com/Huma-Mohsin/todo-app-hackathon-ii`
2. Verify you see:
   - ✅ `.claude/skills/` folder (3 skills)
   - ✅ `phase-1-console-app/` folder
   - ✅ `BONUS_POINTS_EVIDENCE.md`
   - ✅ `README.md` displays nicely
   - ✅ 26 files total

### Step 4: Update README (Optional but Recommended)

Add a main README.md at the root to explain the project:

```bash
# Navigate to project root
cd "C:\Users\Huma Aftab\OneDrive\Documents\Gemini_cli_practice_q4\cloud-native-ai-todo-Hackathon2\my-app"

# Create README
# (Claude will help you create this in the next step)
```

---

## Authentication Options

### Option A: HTTPS with Token (Recommended for Windows)

1. When git asks for password, **DO NOT use your GitHub password**
2. Instead, create a **Personal Access Token**:
   - Go to: https://github.com/settings/tokens
   - Click "Generate new token (classic)"
   - Select scopes: `repo` (full control)
   - Copy the token
   - Use token as password when pushing

### Option B: SSH (Alternative)

If you prefer SSH:

```bash
# Check if you have SSH key
ls ~/.ssh/id_rsa.pub

# If not, create one
ssh-keygen -t rsa -b 4096 -C "160951214+Huma-Mohsin@users.noreply.github.com"

# Add to GitHub
# Go to: https://github.com/settings/keys
# Add new SSH key, paste contents of ~/.ssh/id_rsa.pub

# Use SSH remote instead
git remote set-url origin git@github.com:Huma-Mohsin/todo-app-hackathon-ii.git
```

---

## Troubleshooting

### Error: "remote origin already exists"

```bash
git remote remove origin
git remote add origin https://github.com/Huma-Mohsin/todo-app-hackathon-ii.git
```

### Error: "Authentication failed"

- Make sure you're using a Personal Access Token, not your password
- Or set up SSH authentication (see Option B above)

### Error: "Updates were rejected"

```bash
# Force push (use carefully - only for first push)
git push -u origin master --force
```

### Can't Push from Windows Git Bash

If you have issues with Git Bash, try:
1. Use **Git CMD** instead
2. Or use **VS Code** integrated terminal
3. Or use **GitHub Desktop** app

---

## After Pushing

Your repository URL will be:
**https://github.com/Huma-Mohsin/todo-app-hackathon-ii**

This is the link you'll use in your hackathon submission form!

---

## Quick Commands Reference

```bash
# Check status
git status

# View commit history
git log --oneline

# View remote
git remote -v

# Push code
git push origin master

# Pull changes (for future)
git pull origin master

# Create new branch (for Phase II)
git checkout -b phase-2-web-app
```
