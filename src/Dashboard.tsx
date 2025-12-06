import React, { useState, useEffect, useMemo, useRef } from 'react';
import { signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';
import { collection, onSnapshot } from 'firebase/firestore';
import { Skull, RefreshCw, Lock } from 'lucide-react';
import { Reorder } from "framer-motion";
import { Link } from 'react-router-dom';

import { auth, db, appId, isFirebaseConfigured } from './lib/firebase';
import { Outlaw } from './types';
import ConfigWarning from './components/ConfigWarning';
import PlayerCard from './components/PlayerCard';

// Main Dashboard Component (Read-Only)
export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [outlaws, setOutlaws] = useState<Outlaw[]>([]);
  const [displayedOutlaws, setDisplayedOutlaws] = useState<Outlaw[]>([]);
  const [loading, setLoading] = useState(true);

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

  // 4. Calculations for Visuals
  const maxBounty = useMemo(() => {
    return outlaws.length > 0 ? Math.max(...outlaws.map(o => o.bounty || 0)) : 100;
  }, [outlaws]);

  // --- Render ---
  return (
    <div className="min-h-screen bg-[#e6dcc3] font-serif text-stone-800 p-4 md:p-8">
      {/* Background Texture Overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-20"
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E")` }}>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">

        {/* Header */}
        <header className="text-center mb-10 border-b-4 border-double border-stone-800 pb-6 relative">
          <div className="absolute top-0 left-0 w-full h-full border-x-2 border-stone-800/20 pointer-events-none"></div>
          <div className="inline-block p-4 bg-[#f4e4bc] border-4 border-stone-800 shadow-xl rotate-1 transform">
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-widest text-stone-900 drop-shadow-sm mb-2">
              Most Wanted
            </h1>
            <div className="flex items-center justify-center gap-2 text-stone-700 font-bold tracking-widest text-sm md:text-base">
              <Skull size={20} />
              <span>DEAD OR ALIVE</span>
              <Skull size={20} />
            </div>
          </div>
          
          {/* Admin Link */}
          <Link 
            to="/admin"
            className="absolute top-4 right-4 bg-stone-800/80 hover:bg-stone-700 text-[#f4e4bc] px-3 py-1.5 text-xs font-bold uppercase tracking-wide flex items-center gap-1.5 shadow-md transition-colors rounded"
          >
            <Lock size={12} />
            Admin
          </Link>
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
                <p className="mb-6 text-stone-500 italic">No outlaws found in these parts.</p>
                <p className="text-sm text-stone-400">
                  Head to the <Link to="/admin" className="text-amber-700 underline hover:text-amber-800">Sheriff's Office</Link> to recruit some outlaws.
                </p>
              </div>
            )}

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
                      isReadOnly={true}
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
  );
}
