import React from 'react';

interface TrueLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showText?: boolean;
}

export const TrueLogo: React.FC<TrueLogoProps> = ({ 
  size = 'md', 
  className = '',
  showText = false
}) => {
  const sizeClasses = {
    sm: showText ? 'w-16 h-8' : 'w-6 h-6',
    md: showText ? 'w-20 h-10' : 'w-8 h-8',
    lg: showText ? 'w-32 h-16' : 'w-12 h-12'
  };

  if (showText) {
    return (
      <div className={`${sizeClasses[size]} ${className} flex items-center space-x-2`}>
        <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0">
          <svg 
            viewBox="0 0 100 100" 
            className="w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="trueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FF0000" />
                <stop offset="50%" stopColor="#FF00FF" />
                <stop offset="100%" stopColor="#800080" />
              </linearGradient>
            </defs>
            <rect width="100" height="100" rx="10" fill="url(#trueGradient)"/>
            <text 
              x="50" 
              y="55" 
              fontFamily="Arial, sans-serif" 
              fontSize="24" 
              fontWeight="bold" 
              fill="white" 
              textAnchor="middle" 
              dominantBaseline="middle"
            >
              true
            </text>
          </svg>
        </div>
        <span className="text-white font-bold">True Agent OS</span>
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} ${className} flex items-center justify-center`}>
      <svg 
        viewBox="0 0 100 100" 
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="trueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FF0000" />
            <stop offset="50%" stopColor="#FF00FF" />
            <stop offset="100%" stopColor="#800080" />
          </linearGradient>
        </defs>
        <rect width="100" height="100" rx="10" fill="url(#trueGradient)"/>
        <text 
          x="50" 
          y="55" 
          fontFamily="Arial, sans-serif" 
          fontSize="24" 
          fontWeight="bold" 
          fill="white" 
          textAnchor="middle" 
          dominantBaseline="middle"
        >
          true
        </text>
      </svg>
    </div>
  );
};
