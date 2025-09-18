
import React from 'react';
import { ReasoningOutput } from './types';

export interface ChatReasoningOutputProps {
  reasoning: string | ReasoningOutput;
  isVisible: boolean;
}

export const ChatReasoningOutput: React.FC<ChatReasoningOutputProps> = ({ 
  reasoning,
  isVisible
}) => {
  if (!isVisible) return null;
  
  // Function to format the reasoning based on its type
  const formatReasoning = () => {
    if (typeof reasoning === 'string') {
      return reasoning;
    } else {
      // Format the ReasoningOutput object into a string
      return [
        `Objective: ${reasoning.objective || 'Not specified'}`,
        `Thought: ${reasoning.thought || ''}`,
        `Steps:`,
        ...(reasoning.reasoning || []).map(step => {
          if (typeof step === 'string') {
            return `- ${step}`;
          } else {
            const confidence = step.confidence ? ` (Confidence: ${(step.confidence * 100).toFixed(1)}%)` : '';
            return `- ${step.step}${confidence}`;
          }
        }),
        `Constraints:`,
        ...(reasoning.constraints || []).map(constraint => `- ${constraint}`),
        reasoning.tools ? `Tools: ${reasoning.tools.join(', ')}` : '',
        reasoning.databases ? `Databases: ${reasoning.databases.join(', ')}` : '',
        `Verification: ${reasoning.verification || ''}`,
        `Overall Confidence: ${reasoning.confidence ? (reasoning.confidence * 100).toFixed(1) + '%' : 'Not specified'}`
      ].filter(Boolean).join('\n');
    }
  };
  
  return (
    <div className="mt-1 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-gray-300">
      <div className="mb-1 flex items-center text-xs text-amber-400">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="mr-1 h-4 w-4">
          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
        </svg>
        <span>Agent reasoning</span>
      </div>
      <div className="whitespace-pre-wrap">{formatReasoning()}</div>
    </div>
  );
};
