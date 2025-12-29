# Git Setup Guide

## Fix Your Git Remote URL

Your current remote URL has a placeholder. Update it with your actual GitHub username:

```bash
git remote set-url origin https://github.com/YOUR_GITHUB_USERNAME/calorie-tracker.git
```

Replace `YOUR_GITHUB_USERNAME` with your actual GitHub username.

## Steps to Push to GitHub

### Option 1: If you already have a GitHub repository

1. **Update the remote URL:**
   ```bash
   git remote set-url origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   ```

2. **Push your code:**
   ```bash
   git push -u origin main
   ```

### Option 2: Create a new GitHub repository first

1. **Go to GitHub.com** and create a new repository:
   - Click the "+" icon → "New repository"
   - Name it `calorie-tracker` (or any name you want)
   - **Don't** initialize with README, .gitignore, or license
   - Click "Create repository"

2. **Update the remote URL:**
   ```bash
   git remote set-url origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   ```

3. **Push your code:**
   ```bash
   git push -u origin main
   ```

## Quick Commands

```bash
# Check current remote
git remote -v

# Update remote URL
git remote set-url origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Verify branch name
git branch

# Push to GitHub
git push -u origin main
```

## If You Get Authentication Errors

If GitHub asks for authentication:

1. **Use a Personal Access Token:**
   - GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
   - Generate new token with `repo` permissions
   - Use the token as your password when pushing

2. **Or use SSH instead:**
   ```bash
   git remote set-url origin git@github.com:YOUR_USERNAME/YOUR_REPO_NAME.git
   ```

