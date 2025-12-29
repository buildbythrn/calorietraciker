# Firebase Authentication Setup Guide

This guide will walk you through setting up Firebase Authentication for the Calorie Tracker app.

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or **"Create a project"**
3. Enter a project name (e.g., "calorie-tracker")
4. Click **"Continue"**
5. (Optional) Disable Google Analytics if you don't need it, or enable it
6. Click **"Create project"**
7. Wait for the project to be created, then click **"Continue"**

## Step 2: Enable Authentication

1. In your Firebase project dashboard, click on **"Authentication"** in the left sidebar
2. Click **"Get started"** (if you see this button)
3. You'll see the Authentication page with different sign-in methods

## Step 3: Enable Email/Password Authentication

1. In the Authentication page, click on the **"Sign-in method"** tab
2. You'll see a list of sign-in providers
3. Click on **"Email/Password"**
4. Toggle the **"Enable"** switch to ON
5. Leave "Email link (passwordless sign-in)" as OFF (unless you want that feature)
6. Click **"Save"**

## Step 4: Get Your Firebase Configuration

1. In the Firebase Console, click the **gear icon** (⚙️) next to "Project Overview"
2. Select **"Project settings"**
3. Scroll down to the **"Your apps"** section
4. If you don't have a web app yet:
   - Click the **Web icon** (`</>`)
   - Register your app with a nickname (e.g., "Calorie Tracker Web")
   - Click **"Register app"**
5. You'll see your Firebase configuration object that looks like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};
```

## Step 5: Set Up Environment Variables

1. In your project root directory, create a file named `.env.local`
2. Copy the following template and fill in your Firebase values:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id_here
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id_here
```

3. Replace each value with the corresponding value from your Firebase config
4. **Important:** Never commit `.env.local` to git (it's already in `.gitignore`)

## Step 6: Set Up Firestore Database

1. In Firebase Console, click on **"Firestore Database"** in the left sidebar
2. Click **"Create database"**
3. Choose **"Start in test mode"** (for development)
   - ⚠️ **Note:** Test mode allows anyone to read/write. For production, you'll need to set up security rules.
4. Select a location for your database (choose the closest to your users)
5. Click **"Enable"**

### Optional: Set Up Basic Security Rules (Recommended for Production)

1. In Firestore, go to the **"Rules"** tab
2. Replace the rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /{collection}/{document} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    // Allow users to create new documents
    match /{collection}/{document} {
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

3. Click **"Publish"**

## Step 7: Test Your Setup

1. Make sure your `.env.local` file is set up correctly
2. Run your development server:
   ```bash
   npm run dev
   ```
3. Open [http://localhost:3000](http://localhost:3000)
4. Try creating a new account:
   - Click "Sign up" (or the toggle to switch to signup)
   - Enter an email and password (minimum 6 characters)
   - Click "Sign Up"
5. You should be redirected to the dashboard
6. Check Firebase Console > Authentication > Users to see your new user

## Troubleshooting

### "Firebase: Error (auth/configuration-not-found)"
- Make sure your `.env.local` file exists and has all the required variables
- Restart your development server after creating/updating `.env.local`
- Check that variable names start with `NEXT_PUBLIC_`

### "Firebase: Error (auth/invalid-api-key)"
- Double-check that you copied the API key correctly from Firebase Console
- Make sure there are no extra spaces or quotes in your `.env.local` file

### "Firebase: Error (auth/network-request-failed)"
- Check your internet connection
- Verify your Firebase project is active in the console

### Authentication works but data doesn't save
- Make sure Firestore Database is created and enabled
- Check that you're using test mode or have proper security rules
- Check browser console for any error messages

## Next Steps

Once authentication is working:
1. Test creating calorie entries, habits, and workouts
2. Verify data appears in Firestore Database
3. Test logging out and logging back in
4. For production, set up proper Firestore security rules

## Security Best Practices

1. **Never commit `.env.local`** - It's already in `.gitignore`
2. **Set up Firestore security rules** before deploying to production
3. **Enable Firebase App Check** for additional security (optional)
4. **Use environment-specific Firebase projects** (dev, staging, production)

## Need Help?

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Authentication Docs](https://firebase.google.com/docs/auth)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)

