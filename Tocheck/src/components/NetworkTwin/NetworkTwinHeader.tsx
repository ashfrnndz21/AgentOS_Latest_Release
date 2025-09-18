
import React from 'react';
import { Radio, Signal, Route, MapPin } from 'lucide-react';

export const NetworkTwinHeader = () => {
  return (
    <div className="glass-panel backdrop-blur-md bg-beam-dark-accent/30 border border-gray-700/50 rounded-xl p-6 shadow-lg">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="mb-4 md:mb-0">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-green-400 text-sm">Active</span>
          </div>
          <h1 className="text-3xl font-bold text-white mt-1 mb-2">Cell Site Digital Twin</h1>
          <p className="text-gray-300">Analyze cell site distribution and performance with AI-powered models</p>
        </div>
        
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-3 px-4 py-2 bg-beam-dark-accent/50 rounded-lg border border-gray-700/50">
            <Radio size={20} className="text-ptt-blue" />
            <div className="flex flex-col">
              <span className="text-sm text-gray-300">Cell Sites</span>
              <span className="text-lg font-semibold text-white">420</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 px-4 py-2 bg-beam-dark-accent/50 rounded-lg border border-gray-700/50">
            <Signal size={20} className="text-ptt-blue" />
            <div className="flex flex-col">
              <span className="text-sm text-gray-300">Coverage</span>
              <span className="text-lg font-semibold text-white">92%</span>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-beam-dark-accent/50 rounded-lg border border-gray-700/50">
            <MapPin size={20} className="text-ptt-blue" />
            <div className="flex flex-col">
              <span className="text-sm text-gray-300">Districts</span>
              <span className="text-lg font-semibold text-white">18</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
