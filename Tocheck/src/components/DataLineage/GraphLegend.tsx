
import React from 'react';

export const GraphLegend: React.FC = () => {
  return (
    <div className="absolute bottom-2 right-2 bg-gray-900/80 backdrop-blur-sm rounded-lg p-3 text-xs text-gray-300 flex flex-wrap items-center gap-3 border border-gray-700/40 shadow-lg">
      <div className="flex items-center">
        <div className="w-3 h-3 rounded-full bg-[#8B5CF6] mr-1.5"></div>
        <span>Data Source</span>
      </div>
      <div className="flex items-center ml-2">
        <div className="w-3 h-3 rounded-full bg-[#10B981] mr-1.5"></div>
        <span>Transformation</span>
      </div>
      <div className="flex items-center ml-2">
        <div className="w-3 h-3 rounded-full bg-[#3B82F6] mr-1.5"></div>
        <span>Aggregation</span>
      </div>
      <div className="flex items-center ml-2">
        <div className="w-3 h-3 rounded-full bg-[#EC4899] mr-1.5"></div>
        <span>Output</span>
      </div>
    </div>
  );
};
