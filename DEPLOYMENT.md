# Deployment Guide

This guide covers multiple ways to deploy your Calorie Tracker app. **Vercel is recommended** as it's made by the Next.js team and offers the easiest deployment.

## Quick Comparison

| Platform | Free Tier | Ease | Best For |
|----------|-----------|------|----------|
| **Vercel** | ✅ Yes | ⭐⭐⭐⭐⭐ | Next.js apps (Recommended) |
| **Netlify** | ✅ Yes | ⭐⭐⭐⭐ | General web apps |
| **Firebase Hosting** | ✅ Yes | ⭐⭐⭐ | Firebase projects |
| **Railway** | ✅ Limited | ⭐⭐⭐ | Full-stack apps |

---

## Option 1: Deploy to Vercel (Recommended) ⭐

Vercel is made by the Next.js team and offers the easiest deployment.

### Prerequisites
- GitHub account (or GitLab/Bitbucket)
- Your code pushed to a Git repository

### Steps

1. **Push your code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/calorie-tracker.git
   git push -u origin main
   ```

2. **Sign up for Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub (recommended)

3. **Import your project**
   - Click **"Add New Project"**
   - Import your GitHub repository
   - Vercel will auto-detect Next.js

4. **Configure Environment Variables**
   - In the project settings, go to **"Environment Variables"**
   - Add all your Firebase variables:
     ```
     NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
     NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
     NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
     NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
     NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
     NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
     ```
   - Make sure to add them for **Production**, **Preview**, and **Development**

5. **Deploy**
   - Click **"Deploy"**
   - Wait 2-3 minutes
   - Your app will be live at `your-app-name.vercel.app`

6. **Custom Domain (Optional)**
   - Go to **Settings** → **Domains**
   - Add your custom domain
   - Follow DNS configuration instructions

### Vercel Free Tier Includes:
- ✅ Unlimited deployments
- ✅ Automatic HTTPS
- ✅ Custom domains
- ✅ Preview deployments for PRs
- ✅ 100 GB bandwidth/month
- ✅ Serverless functions

---

## Option 2: Deploy to Netlify

### Steps

1. **Push your code to GitHub** (same as Vercel)

2. **Sign up for Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Sign up with GitHub

3. **Create new site**
   - Click **"Add new site"** → **"Import an existing project"**
   - Connect your GitHub repository
   - Configure build settings:
     - **Build command:** `npm run build`
     - **Publish directory:** `.next`
     - **Base directory:** (leave empty)

4. **Add Environment Variables**
   - Go to **Site settings** → **Environment variables**
   - Add all your Firebase variables (same as Vercel)

5. **Deploy**
   - Click **"Deploy site"**
   - Your app will be live at `your-app-name.netlify.app`

### Netlify Free Tier Includes:
- ✅ 100 GB bandwidth/month
- ✅ 300 build minutes/month
- ✅ Automatic HTTPS
- ✅ Custom domains

---

## Option 3: Deploy to Firebase Hosting

Since you're already using Firebase, this keeps everything in one place.

### Steps

1. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**
   ```bash
   firebase login
   ```

3. **Initialize Firebase Hosting**
   ```bash
   firebase init hosting
   ```
   - Select your Firebase project
   - **Public directory:** `.next`
   - **Single-page app:** Yes
   - **Overwrite index.html:** No

4. **Update `firebase.json`**
   Create or update `firebase.json`:
   ```json
   {
     "hosting": {
       "public": ".next",
       "ignore": [
         "firebase.json",
         "**/.*",
         "**/node_modules/**"
       ],
       "rewrites": [
         {
           "source": "**",
           "destination": "/index.html"
         }
       ]
     }
   }
   ```

5. **Build your app**
   ```bash
   npm run build
   ```

6. **Deploy**
   ```bash
   firebase deploy --only hosting
   ```

### Note:
Firebase Hosting works best with static exports. For Next.js with server-side features, Vercel or Netlify are better options.

---

## Option 4: Deploy to Railway

Good for full-stack apps with more control.

### Steps

1. **Sign up at [railway.app](https://railway.app)**

2. **Create new project**
   - Click **"New Project"**
   - Select **"Deploy from GitHub repo"**

3. **Configure**
   - Railway auto-detects Next.js
   - Add environment variables in the **Variables** tab

4. **Deploy**
   - Railway automatically deploys on push

---

## Pre-Deployment Checklist

Before deploying, make sure:

- [ ] **Environment variables are set** in your hosting platform
- [ ] **Firebase Authentication is configured** for your domain
- [ ] **Firestore security rules are set** (not in test mode for production)
- [ ] **PWA icons are created** (`icon-192.png` and `icon-512.png` in `public/`)
- [ ] **Test the app locally** with `npm run build && npm start`

## Configure Firebase for Production

### 1. Add Authorized Domains

1. Go to Firebase Console → **Authentication** → **Settings**
2. Scroll to **Authorized domains**
3. Add your deployment domain (e.g., `your-app.vercel.app`)
4. Add your custom domain if you have one

### 2. Update Firestore Security Rules

Replace test mode rules with production rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /calorieEntries/{entryId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    
    match /habits/{habitId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    
    match /habitEntries/{entryId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    
    match /workouts/{workoutId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

### 3. Test Production Build Locally

```bash
npm run build
npm start
```

Visit `http://localhost:3000` and test:
- Sign up / Login
- Add calorie entries
- Create habits
- Log workouts

## Post-Deployment

After deploying:

1. **Test your live app**
   - Try signing up
   - Test all features
   - Check on mobile devices

2. **Set up custom domain** (optional)
   - Follow your platform's domain setup guide
   - Update Firebase authorized domains

3. **Monitor usage**
   - Check Firebase Console for usage
   - Monitor Vercel/Netlify analytics

4. **Set up monitoring** (optional)
   - Add error tracking (Sentry, LogRocket)
   - Set up analytics (Google Analytics, Plausible)

## Troubleshooting

### "Firebase: Error (auth/unauthorized-domain)"
- Add your deployment domain to Firebase authorized domains
- Firebase Console → Authentication → Settings → Authorized domains

### "Build failed"
- Check build logs in your hosting platform
- Make sure all dependencies are in `package.json`
- Try building locally: `npm run build`

### "Environment variables not working"
- Make sure variable names start with `NEXT_PUBLIC_`
- Redeploy after adding variables
- Check variable names match exactly

### "App works locally but not deployed"
- Check browser console for errors
- Verify environment variables are set
- Check Firebase authorized domains

## Continuous Deployment

All platforms support automatic deployments:
- **Vercel/Netlify:** Auto-deploy on every push to main branch
- **Firebase:** Run `firebase deploy` manually or set up CI/CD
- **Railway:** Auto-deploy on push

## Recommended: Vercel

For this Next.js app, **Vercel is the best choice** because:
- ✅ Made by Next.js team
- ✅ Zero configuration needed
- ✅ Automatic optimizations
- ✅ Free tier is generous
- ✅ Best performance for Next.js

## Quick Start (Vercel)

```bash
# 1. Push to GitHub
git add .
git commit -m "Ready to deploy"
git push

# 2. Go to vercel.com and import your repo
# 3. Add environment variables
# 4. Deploy!
```

That's it! Your app will be live in ~2 minutes.

---

## Need Help?

- [Vercel Documentation](https://vercel.com/docs)
- [Netlify Documentation](https://docs.netlify.com)
- [Firebase Hosting Docs](https://firebase.google.com/docs/hosting)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

