
import React from 'react';

export const BankingBanner = () => {
  return (
    <div className="flex items-center space-x-3">
      <div className="flex items-center justify-center w-10 h-10 bg-white rounded-lg p-1">
        <img 
          src="/lovable-uploads/a10b19c4-4389-4ff7-93ba-658a33b12c22.png" 
          alt="Banking Logo" 
          className="w-full h-full object-contain"
        />
      </div>
      <div className="flex flex-col">
        <h1 className="text-lg font-bold text-white leading-tight">Banking</h1>
        <span className="text-xs text-gray-400 leading-tight">Agent OS</span>
      </div>
    </div>
  );
};
