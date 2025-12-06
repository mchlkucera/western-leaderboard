import React from 'react';

interface GoldBarProps {
  value: number;
  max: number;
}

const GoldBar: React.FC<GoldBarProps> = ({ value, max }) => {
  const percentage = Math.max(0, Math.min(100, (value / max) * 100));

  return (
    <div className="w-full h-10 bg-stone-900/40 rounded-sm border-2 border-stone-800/50 relative overflow-hidden shadow-inner p-1">
       {/* Background track texture */}
       <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #000 0, #000 1px, transparent 0, transparent 50%)', backgroundSize: '10px 10px' }}></div>
      
      <div 
        className="h-full relative transition-all duration-500 ease-out shadow-lg group"
        style={{ width: `${percentage}%` }}
      >
        {/* Main Gold Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-yellow-300 via-amber-500 to-amber-700 rounded-sm border border-yellow-200/50"></div>
        
        {/* Shine/Reflection */}
        <div className="absolute inset-x-0 top-0 h-[40%] bg-gradient-to-b from-white/60 to-transparent rounded-t-sm"></div>
        <div className="absolute inset-x-0 bottom-0 h-[20%] bg-gradient-to-t from-black/20 to-transparent rounded-b-sm"></div>
        
        {/* Bevel Highlights */}
        <div className="absolute top-0 left-0 right-0 h-px bg-white/70"></div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-amber-900/50"></div>
        
        {/* Texture/Grain */}
         <div className="absolute inset-0 opacity-20 mix-blend-overlay"
             style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='4' height='4' viewBox='0 0 4 4' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 3h1v1H1V3zm2-2h1v1H3V1z' fill='%23000' fill-opacity='0.2' fill-rule='evenodd'/%3E%3C/svg%3E")` }}>
        </div>
      </div>
    </div>
  );
};

export default GoldBar;

