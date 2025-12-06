import { useState, FormEvent, useMemo } from 'react';
import { ScrollText, X, Plus, Search } from 'lucide-react';
import { Reorder } from "framer-motion";

import { isFirebaseConfigured } from './lib/firebase';
import ConfigWarning from './components/ConfigWarning';
import PlayerCard from './components/PlayerCard';
import { useOutlaws } from './hooks/useOutlaws';
import { Layout } from './components/Layout';
import { Header } from './components/Header';
import { LoadingState } from './components/LoadingState';
import { EmptyState } from './components/EmptyState';
import { PasswordGate } from './components/PasswordGate';

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
  const [searchTerm, setSearchTerm] = useState("");

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

  const filteredOutlaws = useMemo(() => {
    if (!searchTerm) return displayedOutlaws;
    return displayedOutlaws.filter(outlaw => 
      outlaw.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [displayedOutlaws, searchTerm]);

  return (
    <PasswordGate>
      <Layout>
        <Header isAdmin />

        {/* Search Bar */}
        <div className="mb-6 relative max-w-md mx-auto">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-stone-500" />
          </div>
          <input
            type="text"
            placeholder="Search for an outlaw..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#fdf6e3] border-2 border-stone-400 rounded-none focus:outline-none focus:border-amber-600 font-serif placeholder-stone-400 shadow-sm"
          />
        </div>

        {loading ? (
          <LoadingState />
        ) : (
          <>
            {outlaws.length === 0 && <EmptyState />}

            {/* Leaderboard Grid */}
            <Reorder.Group 
                axis="y" 
                values={displayedOutlaws} 
                onReorder={() => {}} 
                className="grid grid-cols-1 md:grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4 mb-8"
            >
              {filteredOutlaws.map((player) => {
                const currentPlayerData = outlaws.find(o => o.id === player.id) || player;
                // We need to find the actual index in the full list for ranking if we want that to persist,
                // or just use the current display index. Let's use the actual rank from the full sorted list.
                const actualIndex = displayedOutlaws.findIndex(o => o.id === player.id);
                
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
                      index={actualIndex}
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

            {/* Post New Bounty Controls - Moved to bottom */}
            <div className="flex flex-col items-center justify-center pb-12 border-t-2 border-stone-300 pt-8">
              {!showAddForm ? (
                <button 
                  onClick={() => setShowAddForm(true)}
                  className="bg-stone-800 hover:bg-stone-700 text-[#f4e4bc] px-6 py-3 font-bold uppercase tracking-wide flex items-center gap-2 shadow-lg transition-all transform hover:-translate-y-1 text-lg"
                >
                  <ScrollText size={24} />
                  Post New Bounty
                </button>
              ) : (
                <div className="w-full max-w-xl relative animate-in bg-[#f4e4bc] p-6 border-4 border-stone-800 shadow-xl">
                  <button 
                    onClick={() => setShowAddForm(false)}
                    className="absolute -top-4 -right-4 bg-stone-800 text-white rounded-full p-2 shadow-md hover:bg-stone-700 z-10 transition-transform hover:scale-110"
                  >
                    <X size={20} />
                  </button>
                  <h3 className="text-xl font-black uppercase text-stone-800 mb-4 flex items-center gap-2">
                    <Plus size={24} className="text-amber-700" />
                    New Wanted Poster
                  </h3>
                  <form onSubmit={handleAddPlayer} className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="w-full">
                      <label className="block text-xs font-bold uppercase text-stone-600 mb-1">Outlaw Name</label>
                      <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="e.g. Buffalo Bill"
                        autoFocus
                        className="w-full bg-[#fdf6e3] border-2 border-stone-400 p-3 font-bold text-lg focus:outline-none focus:border-amber-600"
                      />
                    </div>
                    <div className="w-full md:w-32">
                      <label className="text-xs font-bold uppercase text-stone-600 mb-1 flex items-center gap-1">
                        Reward
                        <img src="/gold-bars.png" className="w-4 h-4" alt="" />
                      </label>
                      <input
                        type="number"
                        value={newBounty}
                        onChange={(e) => setNewBounty(e.target.value)}
                        className="w-full bg-[#fdf6e3] border-2 border-stone-400 p-3 font-mono text-right text-lg focus:outline-none focus:border-amber-600"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={!user}
                      className="w-full md:w-auto bg-stone-800 text-[#f4e4bc] p-3 px-6 font-bold uppercase hover:bg-stone-700 transition-colors text-lg flex items-center justify-center gap-2"
                    >
                      <ScrollText size={20} />
                      Post
                    </button>
                  </form>
                </div>
              )}
            </div>
          </>
        )}
      </Layout>
    </PasswordGate>
  );
}
