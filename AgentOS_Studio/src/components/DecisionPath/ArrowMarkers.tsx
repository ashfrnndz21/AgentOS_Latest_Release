
import React from 'react';

export const ArrowMarkers: React.FC = () => {
  return (
    <defs>
      <marker
        id="arrowhead"
        markerWidth="10"
        markerHeight="7"
        refX="0"
        refY="3.5"
        orient="auto"
      >
        <polygon points="0 0, 10 3.5, 0 7" fill="#FFFFFF" />
      </marker>
      <marker
        id="arrowhead-purple"
        markerWidth="10"
        markerHeight="7"
        refX="0"
        refY="3.5"
        orient="auto"
      >
        <polygon points="0 0, 10 3.5, 0 7" fill="#9C6EFF" />
      </marker>
      <marker
        id="arrowhead-highlight"
        markerWidth="10"
        markerHeight="7"
        refX="0"
        refY="3.5"
        orient="auto"
      >
        <polygon points="0 0, 10 3.5, 0 7" fill="#FFFFFF" />
      </marker>
    </defs>
  );
};
