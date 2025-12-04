# 🤠 Western Leaderboard - Most Wanted

A Western-themed leaderboard app built with React, Vite, Firebase, and Tailwind CSS. Track outlaws and their gold bounties in real-time!

![Western Leaderboard](https://api.dicebear.com/9.x/adventurer/svg?seed=WesternLeaderboard&size=200)

## Features

- 🏆 Real-time leaderboard with animated rankings
- 💰 Gold bar visualization for bounty amounts
- 🔄 Live synchronization across devices via Firebase
- 🎨 Western/Old West themed UI with paper textures
- 📱 Fully responsive design
- ✨ Smooth animations with Framer Motion

## Quick Start

### Prerequisites

- Node.js 18+ 
- A Firebase project

### 1. Clone and Install

```bash
cd western
npm install
```

### 2. Configure Firebase

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project (or use existing)
3. Add a web app to your project
4. Enable **Anonymous Authentication**:
   - Go to Authentication → Sign-in method
   - Enable "Anonymous"
5. Create a **Firestore Database**:
   - Go to Firestore Database → Create database
   - Start in test mode (or configure rules as needed)

### 3. Set Up Environment Variables

Create a `.env` file in the project root:

```env
VITE_FIREBASE_API_KEY=your-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456

# Optional: Custom app ID for data isolation
VITE_APP_ID=western-leaderboard
```

### 4. Run the App

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

## Deployment

### Vercel

```bash
npm i -g vercel
vercel
```

Add your environment variables in the Vercel dashboard.

### Netlify

```bash
npm run build
# Deploy the `dist` folder
```

Add environment variables in Netlify's site settings.

### Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy
```

## Firestore Security Rules

For production, update your Firestore rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /artifacts/{appId}/public/data/leaderboard/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool
- **TypeScript** - Type safety
- **Firebase** - Auth & Firestore
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Lucide React** - Icons

## License

MIT

