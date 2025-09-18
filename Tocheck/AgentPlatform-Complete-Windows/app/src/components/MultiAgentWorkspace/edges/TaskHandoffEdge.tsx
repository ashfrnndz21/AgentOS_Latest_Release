import React from 'react';
import { BaseEdge, EdgeLabelRenderer, getBezierPath } from '@xyflow/react';
import { ArrowRight } from 'lucide-react';

export const TaskHandoffEdge = ({
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
          stroke: '#10b981',
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
          <div className="bg-beam-dark-accent border border-gray-600 rounded-md px-2 py-1 text-xs text-gray-300 flex items-center gap-1 shadow-lg">
            <ArrowRight className="h-3 w-3 text-green-400" />
            <span>{data?.label || 'Task Handoff'}</span>
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  );
};