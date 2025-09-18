import React from 'react';
import { BaseEdge, EdgeLabelRenderer, getBezierPath } from '@xyflow/react';
import { ArrowRight } from 'lucide-react';

export const ModernTaskHandoffEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}: any) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge 
        path={edgePath} 
        markerEnd={markerEnd} 
        style={{
          ...style,
          strokeWidth: 2,
          stroke: '#E31E24',
        }} 
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
        >
          <div className="bg-beam-dark-accent border border-gray-600 rounded-full px-3 py-1 text-xs text-gray-300 flex items-center gap-1 shadow-lg backdrop-blur-sm">
            <ArrowRight className="h-3 w-3 text-beam-blue" />
            <span className="font-medium">{data?.label || 'Transfer'}</span>
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  );
};