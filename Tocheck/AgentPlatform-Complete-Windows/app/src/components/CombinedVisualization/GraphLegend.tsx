
import React from 'react';

interface GraphLegendProps {
  nodeTypes: {
    [key: string]: {
      color: string;
      icon: string;
    };
  };
  visualizationType: 'decision' | 'lineage' | 'combined';
}

export const GraphLegend: React.FC<GraphLegendProps> = ({ 
  nodeTypes, 
  visualizationType 
}) => {
  // Define data lineage node types (would come from metadata in real app)
  const lineageNodeTypes = {
    'data_source': { color: '#8B5CF6' },
    'transformation': { color: '#10B981' },
    'aggregation': { color: '#3B82F6' },
    'output': { color: '#EC4899' }
  };
  
  return (
    <div className="absolute bottom-2 right-2 bg-gray-900/80 backdrop-blur-sm rounded-lg p-3 text-xs text-gray-300 flex flex-wrap items-center gap-3 border border-gray-700/40 shadow-lg max-w-md">
      {/* Decision Path Legend */}
      {(visualizationType === 'decision' || visualizationType === 'combined') && (
        <>
          {Object.entries(nodeTypes).map(([key, value]) => (
            <div key={key} className="flex items-center">
              <div 
                className="w-3 h-3 rounded-full mr-1.5"
                style={{ backgroundColor: value.color }}
              ></div>
              <span>{key === 'tool' ? 'Tool' : key.charAt(0).toUpperCase() + key.slice(1)}</span>
            </div>
          ))}
        </>
      )}
      
      {/* Data Lineage Legend */}
      {(visualizationType === 'lineage' || visualizationType === 'combined') && (
        <>
          {Object.entries(lineageNodeTypes).map(([key, value]) => (
            <div key={key} className="flex items-center">
              <div 
                className="w-3 h-3 rounded-full mr-1.5"
                style={{ backgroundColor: value.color }}
              ></div>
              <span>{key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</span>
            </div>
          ))}
        </>
      )}
      
      {/* Combined View Legend */}
      {visualizationType === 'combined' && (
        <div className="flex items-center ml-2">
          <div className="w-4 h-0.5 bg-purple-400 mr-1.5 border-dashed"></div>
          <span>Cross-connections</span>
        </div>
      )}
    </div>
  );
};
