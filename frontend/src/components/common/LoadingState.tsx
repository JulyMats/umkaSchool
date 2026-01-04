import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  text?: string; 
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
  className?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({ 
  message,
  text,
  size = 'md',
  fullScreen = false,
  className = ''
}) => {
  const displayText = message || text || 'Loading...';
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const content = (
    <div className={`flex flex-col items-center justify-center gap-4 ${className}`}>
      <Loader2 className={`${sizeClasses[size]} animate-spin text-pink-500`} />
      {displayText && <p className="text-gray-600 dark:text-gray-400">{displayText}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-75 z-50">
        {content}
      </div>
    );
  }

  return <div className="flex items-center justify-center py-8">{content}</div>;
};

export default LoadingState;

