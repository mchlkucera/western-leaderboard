import React from 'react';
import { Link } from 'react-router-dom';

export const EmptyState: React.FC = () => (
  <div className="bg-[#fdf6e3] border-4 border-dashed border-stone-400 p-8 text-center rounded-lg shadow-lg mb-8">
    <h3 className="text-2xl font-bold mb-4 text-stone-600">This Town is Too Quiet...</h3>
    <p className="mb-6 text-stone-500 italic">No outlaws found in these parts.</p>
    <p className="text-sm text-stone-400">
      Head to the <Link to="/admin" className="text-amber-700 underline hover:text-amber-800">Sheriff's Office</Link> to recruit some outlaws.
    </p>
  </div>
);


