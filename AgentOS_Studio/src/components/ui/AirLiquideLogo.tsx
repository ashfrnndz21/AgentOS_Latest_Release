import React from 'react';

interface AirLiquideLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showText?: boolean;
}

export const AirLiquideLogo: React.FC<AirLiquideLogoProps> = ({ 
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
      <div className={`${sizeClasses[size]} ${className} flex flex-col items-center justify-center`}>
        <svg 
          viewBox="0 0 200 120" 
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Air Liquide circular "a" logo */}
          <circle 
            cx="100" 
            cy="40" 
            r="35" 
            fill="#4A6FA5" 
            stroke="none"
          />
          {/* White "a" inside the circle */}
          <path 
            d="M85 60 L90 45 L95 60 M87 55 L93 55 M105 45 L105 60 M105 45 Q115 45 115 52.5 Q115 60 105 60" 
            stroke="white" 
            strokeWidth="2.5" 
            fill="none" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
          
          {/* Air Liquide text in red */}
          <text 
            x="100" 
            y="95" 
            textAnchor="middle" 
            fill="#E31E24" 
            fontSize="14" 
            fontFamily="Arial, sans-serif" 
            fontWeight="bold"
          >
            Air Liquide
          </text>
        </svg>
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
        {/* Air Liquide circular "a" logo */}
        <circle 
          cx="50" 
          cy="50" 
          r="45" 
          fill="#4A6FA5" 
          stroke="none"
        />
        {/* White "a" inside the circle */}
        <path 
          d="M30 70 L37 50 L44 70 M33 63 L41 63 M56 50 L56 70 M56 50 Q68 50 68 60 Q68 70 56 70" 
          stroke="white" 
          strokeWidth="3.5" 
          fill="none" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};