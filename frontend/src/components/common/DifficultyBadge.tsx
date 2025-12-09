import React from 'react';

type Difficulty = 'beginner' | 'intermediate' | 'advanced';

interface DifficultyBadgeProps {
  difficulty: Difficulty;
  className?: string;
}

const DifficultyBadge: React.FC<DifficultyBadgeProps> = ({
  difficulty,
  className = ''
}) => {
  const difficultyStyles = {
    beginner: 'bg-green-400 text-white',
    intermediate: 'bg-yellow-400 text-white',
    advanced: 'bg-red-400 text-white'
  };

  const displayText = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-bold shadow-md ${difficultyStyles[difficulty]} ${className}`}
    >
      {displayText}
    </span>
  );
};

export default DifficultyBadge;

