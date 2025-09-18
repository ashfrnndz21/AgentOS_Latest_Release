import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { TrendingUp, AlertTriangle, Shield, Target } from 'lucide-react';

export const RiskNode = ({ data, selected }: any) => {
  const getRiskLevel = (level: string) => {
    switch (level) {
      case 'low':
        return { color: 'text-green-400', bg: 'bg-green-900/30 border-green-600', icon: Shield };
      case 'medium':
        return { color: 'text-yellow-400', bg: 'bg-yellow-900/30 border-yellow-600', icon: Target };
      case 'high':
        return { color: 'text-red-400', bg: 'bg-red-900/30 border-red-600', icon: AlertTriangle };
      default:
        return { color: 'text-gray-400', bg: 'bg-gray-900/30 border-gray-600', icon: TrendingUp };
    }
  };

  const riskLevel = data.riskLevel || 'medium';
  const riskInfo = getRiskLevel(riskLevel);
  const RiskIcon = riskInfo.icon;

  return (
    <div className={`border-2 rounded-lg p-1 min-w-[85px] max-w-[105px] ${
      selected ? 'border-blue-400' : 'border-blue-600'
    } hover:border-blue-400/70 transition-colors ${riskInfo.bg}`}>
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-blue-400 border-2 border-white"
      />
      
      <div className="flex items-center gap-1 mb-1.5">
        <TrendingUp className="h-3 w-3 text-blue-400" />
        <h3 className="text-white font-medium text-[8px] truncate font-sans">{data.label || 'Risk'}</h3>
      </div>
      
      <div className="space-y-1 text-[7px] text-gray-300">
        <div className="flex items-center gap-0.5">
          <span className="font-medium font-sans">Type:</span>
          <span className="truncate font-mono">{data.riskType?.charAt(0) || 'O'}</span>
        </div>
        
        <div className="flex items-center gap-0.5">
          <span className="font-medium font-sans">Cat:</span>
          <span className="truncate font-mono">{data.category?.split(' ')[0] || 'Credit'}</span>
        </div>
        
        <div className="flex items-center gap-0.5">
          <RiskIcon className={`h-2 w-2 ${riskInfo.color}`} />
          <span className={`${riskInfo.color} truncate font-mono`}>
            {riskLevel.charAt(0).toUpperCase()}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="font-sans">Score:</span>
          <span className={`${riskInfo.color} font-mono`}>{data.riskScore || 'N/A'}</span>
        </div>
      </div>
      
      <div className="mt-1 pt-1 border-t border-gray-600">
        <div className="w-full bg-gray-700 rounded-full h-0.5">
          <div 
            className={`h-0.5 rounded-full ${
              riskLevel === 'low' ? 'bg-green-400' : 
              riskLevel === 'medium' ? 'bg-yellow-400' : 'bg-red-400'
            }`} 
            style={{ width: `${data.riskPercentage || 50}%` }}
          ></div>
        </div>
      </div>
      
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-blue-400 border-2 border-white"
      />
    </div>
  );
};