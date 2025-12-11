import React from 'react';

interface AnimatedBackgroundProps {
  children: React.ReactNode;
  className?: string;
}

const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({ 
  children, 
  className = '' 
}) => {
  const hasCustomBg = className.includes('bg-');
  const defaultBg = hasCustomBg ? '' : 'bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50';
  
  return (
    <div className={`min-h-screen flex flex-col items-center justify-center ${defaultBg} py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden ${className}`}>
      {/* Decorative animals - smaller and repositioned on mobile */}
      <div 
        className="absolute top-2 left-2 sm:top-10 sm:left-10 text-3xl sm:text-5xl lg:text-6xl animate-bounce pointer-events-none z-0" 
        style={{ animationDuration: '3s' }}
        aria-hidden="true"
      >
        🐻
      </div>
      <div 
        className="absolute top-2 right-2 sm:top-20 sm:right-20 text-3xl sm:text-5xl animate-bounce pointer-events-none z-0" 
        style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}
        aria-hidden="true"
      >
        🦊
      </div>
      <div 
        className="absolute bottom-2 left-2 sm:bottom-20 sm:left-20 text-3xl sm:text-5xl animate-bounce pointer-events-none z-0" 
        style={{ animationDuration: '2.8s', animationDelay: '1s' }}
        aria-hidden="true"
      >
        🐰
      </div>
      <div 
        className="absolute bottom-2 right-2 sm:bottom-10 sm:right-10 text-3xl sm:text-5xl lg:text-6xl animate-bounce pointer-events-none z-0" 
        style={{ animationDuration: '3.2s', animationDelay: '1.5s' }}
        aria-hidden="true"
      >
        🐱
      </div>
      <div className="relative z-10 w-full flex justify-center">
        {children}
      </div>
    </div>
  );
};

export default AnimatedBackground;

