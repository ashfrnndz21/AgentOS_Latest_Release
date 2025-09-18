
import React from 'react';
import { Brain, Loader } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ThinkingIndicatorProps {
  isVisible: boolean;
  mode?: 'thinking' | 'processing' | 'analyzing';
}

export const ThinkingIndicator: React.FC<ThinkingIndicatorProps> = ({ 
  isVisible, 
  mode = 'thinking' 
}) => {
  if (!isVisible) return null;
  
  const messages = {
    thinking: "Thinking...",
    processing: "Processing...",
    analyzing: "Analyzing data..."
  };

  const currentMessage = messages[mode];
  
  return (
    <div className={cn(
      "fixed bottom-24 left-1/2 transform -translate-x-1/2 z-50",
      "bg-beam-dark-accent/90 backdrop-blur-md border border-beam-blue/30 px-4 py-2 rounded-full",
      "text-sm text-beam-blue-light shadow-glow-blue flex items-center gap-2",
      "animate-fade-in transition-opacity duration-300 ease-in-out"
    )}>
      <div className="relative w-5 h-5 mr-1">
        <Brain size={20} className="absolute inset-0 text-beam-blue animate-pulse-slow" />
        <Loader size={20} className="absolute inset-0 text-beam-blue-light animate-spin" />
      </div>
      <span>{currentMessage}</span>
      <span className="flex space-x-1">
        <span className="inline-block animate-bounce delay-0">.</span>
        <span className="inline-block animate-bounce delay-100">.</span>
        <span className="inline-block animate-bounce delay-200">.</span>
      </span>
    </div>
  );
};
