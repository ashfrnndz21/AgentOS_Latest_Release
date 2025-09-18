
import React from 'react';

interface NetworkGraphProps {
  viewType: string;
  region: string;
  model: string;
  district?: string;
}

export const NetworkGraph: React.FC<NetworkGraphProps> = ({ 
  viewType, 
  region, 
  model, 
  district 
}) => {
  // Function to get the model display name
  const getModelDisplayName = (modelType: string) => {
    switch(modelType) {
      case 'churn': return 'Churn Model';
      case 'propensity': return 'Propensity Model';
      case 'arpu': return 'ARPU Model';
      case 'apra': return 'APRA Model';
      default: return 'Network Model';
    }
  };
  
  // Function to get the view type display name
  const getViewDisplayName = (view: string) => {
    switch(view) {
      case 'physical': return 'Physical Network';
      case 'district': return 'By District';
      case 'state': return 'By State';
      case 'capacity': return 'Capacity Heat Map';
      default: return 'Network View';
    }
  };
  
  const getLocationDetail = () => {
    if (viewType === 'district' && district && district !== 'all') {
      return ` in ${district.charAt(0).toUpperCase() + district.slice(1)} District`;
    } else if (viewType === 'state' && region && region !== 'all') {
      return ` in ${region.charAt(0).toUpperCase() + region.slice(1)} State`;
    } else if (region !== 'all') {
      return ` in ${region.charAt(0).toUpperCase() + region.slice(1)} Region`;
    }
    return '';
  };
  
  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <div className="relative w-full h-[500px] bg-beam-dark-accent/20 rounded-lg overflow-hidden border border-gray-700/50">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="mb-4 text-ptt-blue">
              <svg className="w-16 h-16 mx-auto" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM7 13.5C6.17 13.5 5.5 12.83 5.5 12C5.5 11.17 6.17 10.5 7 10.5C7.83 10.5 8.5 11.17 8.5 12C8.5 12.83 7.83 13.5 7 13.5ZM12 13.5C11.17 13.5 10.5 12.83 10.5 12C10.5 11.17 11.17 10.5 12 10.5C12.83 10.5 13.5 11.17 13.5 12C13.5 12.83 12.83 13.5 12 13.5ZM17 13.5C16.17 13.5 15.5 12.83 15.5 12C15.5 11.17 16.17 10.5 17 10.5C17.83 10.5 18.5 11.17 18.5 12C18.5 12.83 17.83 13.5 17 13.5Z" fill="currentColor"/>
              </svg>
            </div>
            <p className="text-lg text-white mb-2">Cell Site Visualization</p>
            <p className="text-sm text-gray-400 mb-4">
              Currently displaying: <span className="font-medium">{getModelDisplayName(model)}</span> with <span className="font-medium">{getViewDisplayName(viewType)}</span>
              <span className="font-medium">{getLocationDetail()}</span>
            </p>
            <p className="text-xs text-gray-500">
              Interactive network visualization will be implemented in a future update
            </p>
          </div>
        </div>
        
        {/* Cell site mockup (this would be replaced with a proper graph visualization) */}
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
          {Array.from({ length: 30 }).map((_, i) => (
            <div 
              key={i}
              className="absolute w-2 h-2 bg-ptt-blue rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                width: `${Math.max(3, Math.random() * 6)}px`,
                height: `${Math.max(3, Math.random() * 6)}px`,
              }}
            />
          ))}
          
          {Array.from({ length: 20 }).map((_, i) => (
            <div 
              key={i}
              className="absolute bg-ptt-blue/30"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: '1px',
                height: `${20 + Math.random() * 80}px`,
                transform: `rotate(${Math.random() * 360}deg)`,
              }}
            />
          ))}
        </div>
        
        {/* Model overlay indication */}
        <div className="absolute bottom-4 right-4 px-3 py-2 bg-beam-dark-accent/70 rounded-md border border-gray-700/50">
          <div className="text-xs text-gray-400">Model Overlay</div>
          <div className="text-sm font-medium text-white">{getModelDisplayName(model)}</div>
        </div>
      </div>
    </div>
  );
};
