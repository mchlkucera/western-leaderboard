import React from 'react';
import { RefreshCw } from 'lucide-react';

export const LoadingState: React.FC = () => (
  <div className="flex justify-center items-center h-40">
    <div className="animate-spin text-amber-700">
      <RefreshCw size={48} />
    </div>
  </div>
);


