import React from 'react';
import { Skull } from 'lucide-react';

const ConfigWarning: React.FC = () => (
  <div className="min-h-screen bg-[#e6dcc3] font-serif text-stone-800 p-4 md:p-8 flex items-center justify-center">
    <div className="max-w-2xl bg-[#fdf6e3] border-4 border-red-700 p-8 shadow-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Skull className="text-red-700" size={40} />
        <h1 className="text-3xl font-black uppercase tracking-wide text-red-700">
          Firebase Not Configured
        </h1>
      </div>
      
      <p className="text-lg mb-6 text-stone-700">
        This here app needs Firebase to track them outlaws. Set up your Firebase credentials to get started.
      </p>
      
      <div className="bg-stone-100 p-4 rounded border border-stone-300 mb-6">
        <h3 className="font-bold mb-2 text-stone-800">Create a <code className="bg-stone-200 px-1 rounded">.env</code> file with:</h3>
        <pre className="text-sm overflow-x-auto text-stone-600">
{`VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef`}
        </pre>
      </div>
      
      <div className="text-sm text-stone-500">
        <p className="mb-2"><strong>To get these values:</strong></p>
        <ol className="list-decimal list-inside space-y-1">
          <li>Go to <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer" className="text-amber-700 underline hover:text-amber-900">Firebase Console</a></li>
          <li>Create a new project or select existing one</li>
          <li>Add a web app to your project</li>
          <li>Copy the config values to your .env file</li>
          <li>Enable Anonymous Authentication in Authentication → Sign-in method</li>
          <li>Create a Firestore database</li>
        </ol>
      </div>
    </div>
  </div>
);

export default ConfigWarning;

