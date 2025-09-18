import React from 'react';
import { EdgeProps, getBezierPath } from '@xyflow/react';

const AnimatedStrandsEdge: React.FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}) => {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      {/* Background path */}
      <path
        id={id}
        style={{
          ...style,
          strokeWidth: 3,
          stroke: style.stroke || '#10b981',
          opacity: 0.3,
        }}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
      />
      
      {/* Animated path */}
      <path
        style={{
          ...style,
          strokeWidth: 2,
          stroke: style.stroke || '#10b981',
          strokeDasharray: '5,5',
          animation: 'dash 1s linear infinite',
        }}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
      />
      
      <style jsx>{`
        @keyframes dash {
          to {
            stroke-dashoffset: -10;
          }
        }
      `}</style>
    </>
  );
};

export default AnimatedStrandsEdge;