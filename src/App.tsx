import React, { useState, useEffect, useMemo, useRef, FormEvent } from 'react';
import { signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';
import { collection, doc, addDoc, updateDoc, deleteDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { Plus, Skull, RefreshCw, ScrollText, X, Eye, Lock, KeyRound } from 'lucide-react';
import { Reorder } from "framer-motion";
import { Link } from 'react-router-dom';

import { auth, db, appId, isFirebaseConfigured } from './lib/firebase';
import { Outlaw } from './types';
import ConfigWarning from './components/ConfigWarning';
import PlayerCard from './components/PlayerCard';

// --- Admin Password from Environment Variables ---
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'sheriff';

// Password Gate Component
const PasswordGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('admin_auth') === 'true';
  });
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem('admin_auth', 'true');
      setIsAuthenticated(true);
      setError(false);
    } else {
      setError(true);
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      setPassword('');
    }
  };

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#e6dcc3] font-serif text-stone-800 p-4 md:p-8 flex items-center justify-center">
      {/* Background Texture Overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-20"
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E")` }}>
      </div>

      <div className={`relative z-10 max-w-md w-full transition-transform ${isShaking ? 'animate-shake' : ''}`}>
        <div className="bg-[#fdf6e3] border-4 border-stone-800 p-8 shadow-2xl">
          {/* Badge/Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-amber-600 rounded-full flex items-center justify-center border-4 border-amber-800 shadow-lg">
              <KeyRound size={36} className="text-[#fdf6e3]" />
            </div>
          </div>

          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-wide text-center text-stone-900 mb-2">
            Sheriff's Office
          </h1>
          <p className="text-center text-stone-500 mb-6 text-sm">
            Restricted Area — Authorized Personnel Only
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-stone-600 mb-2 tracking-wider">
                Enter Password
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(false);
                  }}
                  placeholder="••••••••"
                  autoFocus
                  className={`w-full bg-[#f4e4bc] border-2 ${error ? 'border-red-500' : 'border-stone-400'} p-3 pl-10 font-mono text-lg focus:outline-none focus:border-amber-600 transition-colors`}
                />
              </div>
              {error && (
                <p className="text-red-600 text-sm mt-2 font-bold flex items-center gap-1">
                  <Skull size={14} />
                  Wrong password, partner. Try again.
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-stone-800 hover:bg-stone-700 text-[#f4e4bc] p-3 font-bold uppercase tracking-wide transition-colors flex items-center justify-center gap-2"
            >
              <Lock size={16} />
              Enter Sheriff's Office
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-stone-300">
            <Link 
              to="/"
              className="text-amber-700 hover:text-amber-800 text-sm font-bold flex items-center justify-center gap-1 transition-colors"
            >
              <Eye size={14} />
              Back to Public Board
            </Link>
          </div>
        </div>

        {/* Decorative corners */}
        <div className="absolute -top-2 -left-2 w-4 h-4 border-t-4 border-l-4 border-stone-800"></div>
        <div className="absolute -top-2 -right-2 w-4 h-4 border-t-4 border-r-4 border-stone-800"></div>
        <div className="absolute -bottom-2 -left-2 w-4 h-4 border-b-4 border-l-4 border-stone-800"></div>
        <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b-4 border-r-4 border-stone-800"></div>
      </div>

      {/* Footer Decoration */}
      <div className="fixed bottom-0 left-0 w-full h-2 bg-stone-800 z-50"></div>
    </div>
  );
};

// Main App Component
export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [outlaws, setOutlaws] = useState<Outlaw[]>([]);
  const [displayedOutlaws, setDisplayedOutlaws] = useState<Outlaw[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [newBounty, setNewBounty] = useState<string | number>(10);
  const [showAddForm, setShowAddForm] = useState(false);

  const sortTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Show config warning if Firebase is not configured
  if (!isFirebaseConfigured) {
    return <ConfigWarning />;
  }

  // 1. Auth Handling
  useEffect(() => {
    if (!auth) return;
    
    const initAuth = async () => {
      try {
        await signInAnonymously(auth!);
      } catch (error) {
        console.error("Auth error:", error);
      }
    };

    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  // 2. Data Fetching
  useEffect(() => {
    if (!user || !db) return;

    const q = collection(db, 'artifacts', appId, 'public', 'data', 'leaderboard');

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Outlaw[] = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      } as Outlaw));
      setOutlaws(data);
      setLoading(false);
    }, (error) => {
      console.error("Firestore error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // 3. Debounced Sorting Logic
  useEffect(() => {
    if (sortTimeoutRef.current) {
      clearTimeout(sortTimeoutRef.current);
    }

    sortTimeoutRef.current = setTimeout(() => {
      const sortedData = [...outlaws].sort((a, b) => (b.bounty || 0) - (a.bounty || 0));
      setDisplayedOutlaws(sortedData);
    }, 750); 

    return () => {
      if (sortTimeoutRef.current) {
        clearTimeout(sortTimeoutRef.current);
      }
    };
  }, [outlaws]);

  // 4. Actions
  const handleAddPlayer = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !newName.trim() || !db) return;

    try {
      const seed = newName + Math.random().toString(36).substring(7);
      const imageUrl = `https://api.dicebear.com/9.x/adventurer/svg?seed=${seed}`;

      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'leaderboard'), {
        name: newName,
        bounty: parseInt(String(newBounty)),
        image: imageUrl,
        createdAt: serverTimestamp(),
        status: "Wanted"
      });
      setNewName("");
      setNewBounty(10);
      setShowAddForm(false);
    } catch (err) {
      console.error("Error adding:", err);
    }
  };

  const updateBounty = async (id: string, currentBounty: number, amount: number) => {
    if (!user || !db) return;
    const newAmount = Math.max(0, currentBounty + amount);
    const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'leaderboard', id);
    await updateDoc(docRef, { bounty: newAmount });
  };

  const setPlayerBounty = async (id: string, amount: number) => {
    if (!user || !db) return;
    const newAmount = Math.max(0, parseInt(String(amount)));
    if (isNaN(newAmount)) return;
    
    const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'leaderboard', id);
    await updateDoc(docRef, { bounty: newAmount });
  };

  const removePlayer = async (id: string) => {
    if (!user || !db) return;
    if (window.confirm("Are you sure this outlaw has been caught?")) {
      const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'leaderboard', id);
      await deleteDoc(docRef);
    }
  };

  // 5. Calculations for Visuals
  const maxBounty = useMemo(() => {
    return outlaws.length > 0 ? Math.max(...outlaws.map(o => o.bounty || 0)) : 100;
  }, [outlaws]);

  // --- Render ---
  return (
    <PasswordGate>
    <div className="min-h-screen bg-[#e6dcc3] font-serif text-stone-800 p-4 md:p-8">
      {/* Background Texture Overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-20"
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E")` }}>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">

        {/* Header */}
        <header className="text-center mb-10 border-b-4 border-double border-stone-800 pb-6 relative">
          <div className="absolute top-0 left-0 w-full h-full border-x-2 border-stone-800/20 pointer-events-none"></div>
          
          {/* View Dashboard Link */}
          <Link 
            to="/"
            className="absolute top-4 left-4 bg-amber-700/90 hover:bg-amber-600 text-[#fdf6e3] px-3 py-1.5 text-xs font-bold uppercase tracking-wide flex items-center gap-1.5 shadow-md transition-colors rounded"
          >
            <Eye size={12} />
            View Board
          </Link>
          
          <div className="inline-block p-4 bg-[#f4e4bc] border-4 border-stone-800 shadow-xl rotate-1 transform">
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-widest text-stone-900 drop-shadow-sm mb-2">
              Most Wanted
            </h1>
            <div className="flex items-center justify-center gap-2 text-stone-700 font-bold tracking-widest text-sm md:text-base">
              <Skull size={20} />
              <span>DEAD OR ALIVE</span>
              <Skull size={20} />
            </div>
            <div className="mt-2 text-xs text-stone-500 font-mono uppercase tracking-widest bg-stone-200/50 px-2 py-1 rounded">
              Sheriff's Office
            </div>
          </div>
        </header>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin text-amber-700">
              <RefreshCw size={48} />
            </div>
          </div>
        ) : (
          <>
            {/* Empty State */}
            {outlaws.length === 0 && (
              <div className="bg-[#fdf6e3] border-4 border-dashed border-stone-400 p-8 text-center rounded-lg shadow-lg mb-8">
                <h3 className="text-2xl font-bold mb-4 text-stone-600">This Town is Too Quiet...</h3>
                <p className="text-stone-500 italic">No outlaws found in these parts. Post a new bounty to get started.</p>
              </div>
            )}

            {/* Controls */}
            <div className="mb-8 flex flex-col items-end">
              {!showAddForm && (
                <button 
                  onClick={() => setShowAddForm(true)}
                  className="bg-stone-800 hover:bg-stone-700 text-[#f4e4bc] px-4 py-2 font-bold uppercase tracking-wide flex items-center gap-2 shadow-md transition-colors"
                >
                  <ScrollText size={18} />
                  Post New Bounty
                </button>
              )}
              
              {showAddForm && (
                <div className="w-full relative animate-in">
                  <button 
                    onClick={() => setShowAddForm(false)}
                    className="absolute -top-3 -right-3 bg-stone-800 text-white rounded-full p-1 shadow-md hover:bg-stone-700 z-10"
                  >
                    <X size={16} />
                  </button>
                  <form onSubmit={handleAddPlayer} className="bg-[#f4e4bc] p-4 border-2 border-stone-800 shadow-md flex flex-col md:flex-row gap-2 items-end md:items-center">
                    <div className="w-full">
                      <label className="block text-xs font-bold uppercase text-stone-600 mb-1">Outlaw Name</label>
                      <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="e.g. Buffalo Bill"
                        className="w-full bg-[#fdf6e3] border border-stone-400 p-2 font-bold focus:outline-none focus:border-amber-600"
                      />
                    </div>
                    <div className="w-full md:w-32">
                      <label className="block text-xs font-bold uppercase text-stone-600 mb-1 flex items-center gap-1">
                        Initial Stash
                        <img src="/gold-bars.png" className="w-3 h-3" alt="" />
                      </label>
                      <input
                        type="number"
                        value={newBounty}
                        onChange={(e) => setNewBounty(e.target.value)}
                        className="w-full bg-[#fdf6e3] border border-stone-400 p-2 font-mono text-right focus:outline-none focus:border-amber-600"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={!user}
                      className="w-full md:w-auto bg-stone-800 text-[#f4e4bc] p-2 px-4 font-bold uppercase hover:bg-stone-700 transition-colors h-[42px]"
                    >
                      <Plus size={20} />
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Leaderboard Grid */}
            <Reorder.Group 
                axis="y" 
                values={displayedOutlaws} 
                onReorder={() => {}} 
                className="grid grid-cols-1 md:grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4"
            >
              {displayedOutlaws.map((player, index) => {
                const currentPlayerData = outlaws.find(o => o.id === player.id) || player;
                
                return (
                  <Reorder.Item
                    key={player.id}
                    value={player}
                    id={player.id}
                    style={{ cursor: "default" }}
                    drag={false}
                    className="h-full"
                  >
                    <PlayerCard 
                      player={player} 
                      liveData={currentPlayerData}
                      index={index}
                      maxBounty={maxBounty}
                      updateBounty={updateBounty}
                      setPlayerBounty={setPlayerBounty}
                      removePlayer={removePlayer}
                      isReadOnly={false}
                    />
                  </Reorder.Item>
                );
              })}
            </Reorder.Group>
          </>
        )}
      </div>

      {/* Footer Decoration */}
      <div className="fixed bottom-0 left-0 w-full h-2 bg-stone-800 z-50"></div>
      <div className="fixed bottom-0 left-0 w-full h-20 bg-gradient-to-t from-[#d4c5a0] to-transparent pointer-events-none z-0"></div>
    </div>
    </PasswordGate>
  );
}
