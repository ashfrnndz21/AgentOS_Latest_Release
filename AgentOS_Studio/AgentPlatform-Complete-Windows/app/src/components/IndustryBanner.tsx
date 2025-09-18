import React from 'react';
import { useIndustry } from '@/contexts/IndustryContext';

export const IndustryBanner = () => {
  const { currentIndustry } = useIndustry();
  
  return (
    <div className="flex items-center space-x-3">
      <div className="flex items-center justify-center w-10 h-10 bg-white rounded-lg p-1">
        <img 
          src={currentIndustry.logo} 
          alt={`${currentIndustry.displayName} Logo`} 
          className="w-full h-full object-contain"
        />
      </div>
      <div className="flex flex-col">
        <h1 className="text-lg font-bold text-white leading-tight">
          {currentIndustry.name.charAt(0).toUpperCase() + currentIndustry.name.slice(1)}
        </h1>
        <span className="text-xs text-gray-400 leading-tight">Agent OS</span>
      </div>
    </div>
  );
};