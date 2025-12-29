# Calorie Tracker App

A comprehensive health and fitness tracking application that allows users to:
- Track daily calories
- Track habits with streak functionality
- Track workouts with streak functionality
- Works on both web and mobile (PWA)

## Features

- 🔐 User authentication with Firebase
- 📊 Daily calorie tracking with meal categorization
- ✅ Habit tracking with streak calculation
- 💪 Workout tracking with streak calculation
- 📱 Progressive Web App (PWA) support for mobile installation
- 📈 Dashboard with overview of all activities
- 🎨 Modern, responsive UI design

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Firebase account (free tier works)

### Installation

1. **Clone or download this repository**

2. **Install dependencies:**
```bash
npm install
```

3. **Set up Firebase:**
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Create a new project (or use existing)
   - Enable Authentication:
     - Go to Authentication > Sign-in method
     - Enable "Email/Password" provider
   - Enable Firestore:
     - Go to Firestore Database
     - Click "Create database"
     - Start in test mode (for development)
   - Get your Firebase config:
     - Go to Project Settings > General
     - Scroll down to "Your apps" section
     - Click the web icon (</>) to add a web app
     - Copy the Firebase configuration object

4. **Create environment file:**
   - Create a `.env.local` file in the root directory
   - Add your Firebase configuration:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

5. **Create PWA Icons (Optional but recommended):**
   - Create two icon files:
     - `public/icon-192.png` (192x192 pixels)
     - `public/icon-512.png` (512x512 pixels)
   - You can use any image editor or online tools to create these
   - For quick testing, you can use placeholder images

6. **Run the development server:**
```bash
npm run dev
```

7. **Open your browser:**
   - Navigate to [http://localhost:3000](http://localhost:3000)
   - Sign up for a new account or log in

## Usage

### Calorie Tracking
- Navigate to "Calories" from the dashboard
- Add food entries with calories and meal type
- View daily totals
- Track calories across different dates

### Habit Tracking
- Navigate to "Habits" from the dashboard
- Create habits with custom names and colors
- Mark habits as complete each day
- View current and longest streaks
- Track multiple habits simultaneously

### Workout Tracking
- Navigate to "Workouts" from the dashboard
- Log workouts with type, duration, and calories burned
- View workout streak on the main page
- Track workouts across different dates

### Mobile Installation (PWA)
- On mobile browsers, you'll see an install prompt
- Or use browser menu: "Add to Home Screen" / "Install App"
- The app will work like a native mobile app

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Authentication:** Firebase Authentication
- **Database:** Firebase Firestore
- **Icons:** Lucide React
- **Date Handling:** date-fns
- **PWA:** Next.js PWA support

## Project Structure

```
calorietracker/
├── app/                    # Next.js app directory
│   ├── dashboard/         # Dashboard page
│   ├── calories/          # Calorie tracking page
│   ├── habits/            # Habit tracking page
│   ├── workouts/          # Workout tracking page
│   ├── layout.tsx         # Root layout with auth provider
│   └── page.tsx           # Home/login page
├── components/            # React components
│   ├── LoginPage.tsx      # Login/signup component
│   └── PWAInstallPrompt.tsx # PWA install prompt
├── lib/                   # Utility libraries
│   ├── auth.tsx           # Authentication context
│   ├── db.ts              # Database operations
│   ├── firebase.ts        # Firebase configuration
│   └── types.ts           # TypeScript type definitions
├── public/                # Static assets
│   ├── manifest.json      # PWA manifest
│   ├── icon-192.png       # PWA icon (192x192)
│   └── icon-512.png       # PWA icon (512x512)
└── scripts/               # Utility scripts
```

## Building for Production

```bash
npm run build
npm start
```

## Deployment

This app can be deployed to:
- **Vercel** (recommended for Next.js)
- **Netlify**
- **Firebase Hosting**
- Any Node.js hosting service

Make sure to set your environment variables in your hosting platform's settings.

## Security Notes

- For production, set up proper Firestore security rules
- Restrict access to user's own data
- Enable proper authentication requirements
- Review Firebase security best practices

## License

This project is open source and available for personal and commercial use.

## Support

For issues or questions, please check the code comments or create an issue in the repository.

