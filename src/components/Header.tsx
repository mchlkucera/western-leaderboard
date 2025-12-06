import React from 'react';
import { Skull, Lock, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

interface HeaderProps {
  isAdmin?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ isAdmin }) => {
  return (
    <header className="text-center mb-10 border-b-4 border-double border-stone-800 pb-6 relative">
      <div className="absolute top-0 left-0 w-full h-full border-x-2 border-stone-800/20 pointer-events-none"></div>
      
      {isAdmin ? (
        <Link 
            to="/"
            className="absolute top-4 left-4 bg-amber-700/90 hover:bg-amber-600 text-[#fdf6e3] px-3 py-1.5 text-xs font-bold uppercase tracking-wide flex items-center gap-1.5 shadow-md transition-colors rounded"
        >
            <Eye size={12} />
            View Board
        </Link>
      ) : (
        <Link 
            to="/admin"
            className="absolute top-4 right-4 bg-stone-800/80 hover:bg-stone-700 text-[#f4e4bc] px-3 py-1.5 text-xs font-bold uppercase tracking-wide flex items-center gap-1.5 shadow-md transition-colors rounded"
        >
            <Lock size={12} />
            Admin
        </Link>
      )}

      <div className="inline-block p-4 bg-[#f4e4bc] border-4 border-stone-800 shadow-xl rotate-1 transform">
        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-widest text-stone-900 drop-shadow-sm mb-2">
          Most Wanted
        </h1>
        <div className="flex items-center justify-center gap-2 text-stone-700 font-bold tracking-widest text-sm md:text-base">
          <Skull size={20} />
          <span>DEAD OR ALIVE</span>
          <Skull size={20} />
        </div>
        {isAdmin && (
            <div className="mt-2 text-xs text-stone-500 font-mono uppercase tracking-widest bg-stone-200/50 px-2 py-1 rounded">
              Sheriff's Office
            </div>
        )}
      </div>
    </header>
  );
};

