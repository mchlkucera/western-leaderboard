import React, { useState, useEffect, ChangeEvent, KeyboardEvent } from 'react';
import { Trophy, Plus, Minus } from 'lucide-react';
import { Outlaw } from '../types';
import GoldBar from './GoldBar';

interface PlayerCardProps {
  player: Outlaw;
  liveData: Outlaw;
  index: number;
  maxBounty: number;
  updateBounty?: (id: string, currentBounty: number, amount: number) => void;
  setPlayerBounty?: (id: string, amount: number) => void;
  removePlayer?: (id: string) => void;
  isReadOnly?: boolean;
}

const PlayerCard: React.FC<PlayerCardProps> = ({ 
  player, 
  liveData, 
  index, 
  maxBounty, 
  updateBounty, 
  setPlayerBounty, 
  removePlayer,
  isReadOnly = false
}) => {
  const isTopThree = index < 3;
  const [localBounty, setLocalBounty] = useState<string | number>(liveData.bounty || 0);
  const [isEditing, setIsEditing] = useState(false);

  // Sync local state with live data unless editing
  useEffect(() => {
    if (!isEditing) {
      setLocalBounty(liveData.bounty || 0);
    }
  }, [liveData.bounty, isEditing]);

  const handleBlur = () => {
    if (isReadOnly || !setPlayerBounty) return;
    setIsEditing(false);
    setPlayerBounty(player.id, Number(localBounty));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
  };

  return (
    <div className={`relative bg-[#fdf6e3] border-2 ${isTopThree ? 'border-amber-600 border-4' : 'border-stone-800'} p-2 shadow-md transition-transform hover:-translate-y-1 h-full flex flex-col`}>
      {/* Rank Badge */}
      <div className="absolute -left-2 -top-2 w-6 h-6 md:-left-3 md:-top-3 md:w-10 md:h-10 bg-stone-800 text-[#f4e4bc] flex items-center justify-center font-black text-xs md:text-xl rounded-full border-2 md:border-4 border-[#f4e4bc] shadow-sm z-20">
        {index + 1}
      </div>

      {isTopThree && (
        <div className="absolute -right-2 -top-4 text-amber-600 z-20 drop-shadow-sm">
          <Trophy size={16} className="md:w-8 md:h-8" fill={index === 0 ? "#d97706" : index === 1 ? "#9ca3af" : "#92400e"} />
        </div>
      )}

      {/* Admin Controls: Plus/Minus - Top Right */}
      {!isReadOnly && updateBounty && (
        <div className="absolute top-2 right-2 flex items-center gap-1 z-10">
           <button
                onClick={() => updateBounty(player.id, liveData.bounty, -1)}
                className="p-1 bg-stone-200 hover:bg-red-100 text-stone-700 hover:text-red-700 rounded transition-colors shadow-sm"
                title="Remove 1 Bar"
            >
                <Minus size={14} />
            </button>
            <button
                onClick={() => updateBounty(player.id, liveData.bounty, 5)}
                className="p-1 bg-stone-200 hover:bg-green-100 text-stone-700 hover:text-green-700 rounded transition-colors shadow-sm"
                title="Add 5 Bars"
            >
                <Plus size={14} />
            </button>
        </div>
      )}

      <div className="flex flex-col gap-2 h-full">
        
        {/* Header Section (Avatar + Name) */}
        <div className="flex flex-row items-center gap-2 w-full pr-14"> {/* Added pr-14 to avoid overlap with admin controls */}
            {/* Avatar Image */}
            <div className="flex-shrink-0">
            <div className="w-10 h-10 md:w-20 md:h-20 bg-stone-300 rounded overflow-hidden border-2 border-stone-600 shadow-inner relative">
                <img 
                src={player.image || `https://api.dicebear.com/9.x/adventurer/svg?seed=${player.name}`} 
                alt={player.name}
                className="w-full h-full object-cover filter sepia contrast-125"
                />
                {/* "Wanted" overlay effect */}
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/40 to-transparent pointer-events-none"></div>
            </div>
            </div>

            {/* Name */}
            <div className="flex-1 min-w-0">
            <h2 className="text-sm md:text-xl font-bold uppercase tracking-tight text-stone-900 truncate leading-tight">
                {player.name}
            </h2>
            <div className="flex flex-wrap items-center gap-2 text-[8px] md:text-xs font-mono mt-0.5">
                <span className="bg-stone-200 px-1 rounded text-stone-500">WANTED</span>
                
                {/* Remove Link */}
                {!isReadOnly && removePlayer && (
                    <button 
                        onClick={() => removePlayer(player.id)}
                        className="text-red-600 hover:text-red-800 underline decoration-dotted hover:decoration-solid transition-all font-bold uppercase tracking-wider"
                    >
                        Remove
                    </button>
                )}
            </div>
            </div>
        </div>

        {/* Bounty Section */}
        <div className="flex-1 w-full flex flex-col justify-end">
          <div className="flex justify-between items-end mb-1">
            <span className="text-[8px] md:text-xs font-bold text-stone-500 uppercase tracking-widest">Gold Stash</span>
            <div className="flex items-center gap-1 text-amber-700 font-mono font-bold text-sm md:text-lg">
              {!isReadOnly && setPlayerBounty ? (
                  <input
                    type="number"
                    value={localBounty}
                    onFocus={() => setIsEditing(true)}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setLocalBounty(e.target.value)}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    className="bg-transparent border-b border-stone-300 focus:border-amber-600 outline-none w-12 md:w-20 text-right font-mono font-bold"
                  />
              ) : (
                  <span>{liveData.bounty || 0}</span>
              )}
              <img 
                src="/gold-bars.png" 
                alt="Gold Bars" 
                className="w-4 h-4 md:w-6 md:h-6 object-contain drop-shadow-sm filter sepia-[.2] contrast-125" 
                title="Gold Stash"
              />
            </div>
          </div>
          <GoldBar value={liveData.bounty || 0} max={maxBounty} />
        </div>

      </div>

      {/* Decorative Corner */}
      <div className="absolute top-1 right-1 w-2 h-2 border-t border-r border-stone-400 pointer-events-none"></div>
      <div className="absolute bottom-1 left-1 w-2 h-2 border-b border-l border-stone-400 pointer-events-none"></div>
    </div>
  );
};

export default PlayerCard;
