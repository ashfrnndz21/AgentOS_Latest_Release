
import React from 'react';
import { CircleUser, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AgentCardProps {
  name: string;
  description?: string;
  imageSrc?: string;
}

export const AgentCard: React.FC<AgentCardProps> = ({ 
  name, 
  description, 
  imageSrc 
}) => {
  return (
    <div className="beam-card agent-card-gradient rounded-xl p-4 overflow-hidden max-w-xs">
      <div className="flex flex-col items-center justify-center h-full">
        {imageSrc ? (
          <img 
            src={imageSrc} 
            alt={name} 
            className="w-20 h-20 object-cover rounded-full mb-4 beam-glow"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-beam-blue-dark flex items-center justify-center mb-4 beam-glow">
            <CircleUser size={40} className="text-white" />
          </div>
        )}
        <h3 className="text-white font-semibold text-lg">{name}</h3>
        {description && (
          <p className="text-white/80 text-sm text-center mt-2">{description}</p>
        )}
      </div>
    </div>
  );
};

export const InfoPanel: React.FC<{
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}> = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);
  
  return (
    <div className="glass-panel mb-4">
      <Button
        variant="ghost"
        className="w-full flex justify-between items-center p-4"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-medium">{title}</span>
        <ChevronDown 
          size={18} 
          className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`} 
        />
      </Button>
      {isOpen && (
        <div className="p-4 pt-0">
          {children}
        </div>
      )}
    </div>
  );
};
