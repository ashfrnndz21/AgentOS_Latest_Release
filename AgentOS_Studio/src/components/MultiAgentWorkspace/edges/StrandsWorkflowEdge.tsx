/**
 * Strands Workflow Edge Component
 * Custom edge for Strands workflow connections
 */

import React from 'react';
import { EdgeProps, getBezierPath, EdgeLabelRenderer } from '@xyflow/react';
import { Badge } from '@/components/ui/badge';

interface StrandsWorkflowEdgeData {
  type: 'dependency' | 'data_flow' | 'conditional';
  label?: string;
  status: 'idle' | 'active' | 'completed' | 'error';
  condition?: string;
}

export const StrandsWorkflowEdge: React.FC<EdgeProps<StrandsWorkflowEdgeData>> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected
}) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const getEdgeColor = () => {
    switch (data?.status) {
      case 'active':
        return '#3b82f6'; // Blue
      case 'completed':
        return '#10b981'; // Green
      case 'error':
        return '#ef4444'; // Red
      default:
        return '#6b7280'; // Gray
    }
  };

  const getEdgeStyle = () => {
    const baseStyle = {
      stroke: getEdgeColor(),
      strokeWidth: selected ? 3 : 2,
      opacity: data?.status === 'active' ? 1 : 0.7
    };

    if (data?.type === 'conditional') {
      return {
        ...baseStyle,
        strokeDasharray: '5,5'
      };
    }

    return baseStyle;
  };

  return (
    <>
      {/* Main Edge Path */}
      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePath}
        style={getEdgeStyle()}
        markerEnd="url(#strands-arrow)"
      />

      {/* Animated Flow Indicator */}
      {data?.status === 'active' && (
        <circle
          r="3"
          fill={getEdgeColor()}
          className="animate-pulse"
        >
          <animateMotion
            dur="2s"
            repeatCount="indefinite"
            path={edgePath}
          />
        </circle>
      )}

      {/* Edge Label */}
      {data?.label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="nodrag nopan"
          >
            <Badge 
              variant="outline" 
              className="bg-slate-800/80 backdrop-blur-sm border-slate-600/50 text-slate-300 text-xs"
            >
              {data.label}
            </Badge>
          </div>
        </EdgeLabelRenderer>
      )}

      {/* Condition Label for Conditional Edges */}
      {data?.type === 'conditional' && data?.condition && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY - 20}px)`,
              pointerEvents: 'all',
            }}
            className="nodrag nopan"
          >
            <Badge 
              variant="outline" 
              className="bg-yellow-800/80 backdrop-blur-sm border-yellow-600/50 text-yellow-300 text-xs"
            >
              {data.condition}
            </Badge>
          </div>
        </EdgeLabelRenderer>
      )}

      {/* SVG Definitions for Arrow Markers */}
      <defs>
        <marker
          id="strands-arrow"
          markerWidth="12"
          markerHeight="12"
          refX="10"
          refY="3"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path
            d="M0,0 L0,6 L9,3 z"
            fill={getEdgeColor()}
          />
        </marker>
      </defs>
    </>
  );
};