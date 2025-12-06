import React from 'react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#e6dcc3] font-serif text-stone-800 p-4 md:p-8">
      {/* Background Texture Overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-20"
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E")` }}>
      </div>

      <div className="w-full relative z-10">
        {children}
      </div>

      {/* Footer Decoration */}
      <div className="fixed bottom-0 left-0 w-full h-2 bg-stone-800 z-50"></div>
      <div className="fixed bottom-0 left-0 w-full h-20 bg-gradient-to-t from-[#d4c5a0] to-transparent pointer-events-none z-0"></div>
    </div>
  );
};


