
import React from 'react';

export const TrueBanner: React.FC<{ minimal?: boolean }> = ({ minimal = false }) => {
  return (
    <div className={`flex items-center ${minimal ? 'gap-2' : 'gap-3'}`}>
      <div className={`relative ${minimal ? 'w-6 h-6' : 'w-10 h-10'} rounded-lg overflow-hidden flex items-center justify-center`}>
        <img 
          src="/lovable-uploads/a10b19c4-4389-4ff7-93ba-658a33b12c22.png" 
          alt="Maxis Logo" 
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex flex-col">
        <span className={`font-bold ${minimal ? 'text-base' : 'text-xl'} text-white leading-tight`}>Maxis</span>
        {!minimal && <span className="text-xs text-green-300/80">AI Hub</span>}
      </div>
    </div>
  );
};
