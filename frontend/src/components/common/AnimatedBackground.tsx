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
      {/* Decorative animals */}
      <div 
        className="absolute top-10 left-10 text-6xl animate-bounce" 
        style={{ animationDuration: '3s' }}
        aria-hidden="true"
      >
        🐻
      </div>
      <div 
        className="absolute top-20 right-20 text-5xl animate-bounce" 
        style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}
        aria-hidden="true"
      >
        🦊
      </div>
      <div 
        className="absolute bottom-20 left-20 text-5xl animate-bounce" 
        style={{ animationDuration: '2.8s', animationDelay: '1s' }}
        aria-hidden="true"
      >
        🐰
      </div>
      <div 
        className="absolute bottom-10 right-10 text-6xl animate-bounce" 
        style={{ animationDuration: '3.2s', animationDelay: '1.5s' }}
        aria-hidden="true"
      >
        🐱
      </div>
      {children}
    </div>
  );
};

export default AnimatedBackground;

