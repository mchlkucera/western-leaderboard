import React, { useState, FormEvent } from 'react';
import { Skull, ScrollText, X, Lock, KeyRound, Plus, Eye } from 'lucide-react';
import { Reorder } from "framer-motion";
import { Link } from 'react-router-dom';

import { isFirebaseConfigured } from './lib/firebase';
import ConfigWarning from './components/ConfigWarning';
import PlayerCard from './components/PlayerCard';
import { useOutlaws } from './hooks/useOutlaws';
import { Layout } from './components/Layout';
import { Header } from './components/Header';
import { LoadingState } from './components/LoadingState';
import { EmptyState } from './components/EmptyState';

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
export default function AdminView() {
  const { 
    user, 
    outlaws, 
    displayedOutlaws, 
    loading, 
    maxBounty, 
    addPlayer, 
    updateBounty, 
    setPlayerBounty, 
    removePlayer 
  } = useOutlaws();

  const [newName, setNewName] = useState("");
  const [newBounty, setNewBounty] = useState<string | number>(10);
  const [showAddForm, setShowAddForm] = useState(false);

  // Show config warning if Firebase is not configured
  if (!isFirebaseConfigured) {
    return <ConfigWarning />;
  }

  const handleAddPlayer = (e: FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    addPlayer(newName, parseInt(String(newBounty)));
    setNewName("");
    setNewBounty(10);
    setShowAddForm(false);
  };

  return (
    <PasswordGate>
      <Layout>
        <Header isAdmin />

        {loading ? (
          <LoadingState />
        ) : (
          <>
            {outlaws.length === 0 && <EmptyState />}

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
                      <label className="text-xs font-bold uppercase text-stone-600 mb-1 flex items-center gap-1">
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
      </Layout>
    </PasswordGate>
  );
}
