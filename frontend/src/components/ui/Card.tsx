import React from 'react';

interface CardProps {
  children: React.ReactNode;
  variant?: 'pink' | 'blue' | 'purple' | 'yellow' | 'gray' | 'white';
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
}

const Card: React.FC<CardProps> = ({
  children,
  variant = 'white',
  className = '',
  padding = 'md'
}) => {
  const variantClasses = {
    pink: 'bg-pink-50',
    blue: 'bg-blue-50',
    purple: 'bg-purple-50',
    yellow: 'bg-yellow-50',
    gray: 'bg-gray-50',
    white: 'bg-white'
  };

  const paddingClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  };

  return (
    <div className={`${variantClasses[variant]} ${paddingClasses[padding]} rounded-2xl ${className}`}>
      {children}
    </div>
  );
};

export default Card;

