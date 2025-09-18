
import React from 'react';

export const ArrowMarkers: React.FC = () => {
  return (
    <defs>
      {/* Standard lineage markers */}
      <marker
        id="arrowhead-lineage"
        markerWidth="10"
        markerHeight="7"
        refX="5"
        refY="3.5"
        orient="auto"
      >
        <polygon points="0 0, 10 3.5, 0 7" fill="#666666" />
      </marker>
      <marker
        id="arrowhead-lineage-highlight"
        markerWidth="10"
        markerHeight="7"
        refX="5"
        refY="3.5"
        orient="auto"
      >
        <polygon points="0 0, 10 3.5, 0 7" fill="#3B82F6" />
      </marker>
      
      {/* Decision path markers */}
      <marker
        id="arrowhead"
        markerWidth="10"
        markerHeight="7"
        refX="5"
        refY="3.5"
        orient="auto"
      >
        <polygon points="0 0, 10 3.5, 0 7" fill="#666666" />
      </marker>
      
      <marker
        id="arrowhead-highlight"
        markerWidth="10"
        markerHeight="7"
        refX="5"
        refY="3.5"
        orient="auto"
      >
        <polygon points="0 0, 10 3.5, 0 7" fill="#FFFFFF" />
      </marker>
      
      <marker
        id="arrowhead-purple"
        markerWidth="10"
        markerHeight="7"
        refX="5"
        refY="3.5"
        orient="auto"
      >
        <polygon points="0 0, 10 3.5, 0 7" fill="#9C6EFF" />
      </marker>
    </defs>
  );
};
