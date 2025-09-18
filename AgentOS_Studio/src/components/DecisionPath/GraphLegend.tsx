
import React from 'react';
import { GraphLegendProps } from './types';

export const GraphLegend: React.FC<GraphLegendProps> = ({ nodeTypes }) => {
  return (
    <div className="absolute bottom-2 right-2 bg-gray-900/80 backdrop-blur-sm rounded-lg p-3 text-xs text-gray-300 flex flex-wrap items-center gap-3 border border-gray-700/40 shadow-lg">
      {Object.entries(nodeTypes).map(([key, value]) => (
        <div key={key} className="flex items-center">
          <div 
            className="w-3 h-3 rounded-full mr-1.5"
            style={{ backgroundColor: value.color }}
          ></div>
          <span>{key === 'tool' ? 'Tool' : key.charAt(0).toUpperCase() + key.slice(1)}</span>
        </div>
      ))}
    </div>
  );
};
