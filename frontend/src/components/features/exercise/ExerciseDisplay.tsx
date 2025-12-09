import React from 'react';

interface ExerciseDisplayProps {
  number: number | null;
  isLoading?: boolean;
}

const ExerciseDisplay: React.FC<ExerciseDisplayProps> = ({ number, isLoading }) => {
  if (isLoading) {
    return (
      <div className="text-center">
        <span className="text-8xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent drop-shadow-lg animate-pulse">
          Loading...
        </span>
      </div>
    );
  }

  return (
    <div className="text-center">
      <span className="text-8xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent drop-shadow-lg animate-pulse">
        {number ?? 'Ready'}
      </span>
    </div>
  );
};

export default ExerciseDisplay;

