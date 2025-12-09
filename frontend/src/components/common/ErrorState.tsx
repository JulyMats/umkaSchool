import { AlertTriangle } from 'lucide-react';
import Button from '../ui/Button';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

const ErrorState: React.FC<ErrorStateProps> = ({ 
  message, 
  onRetry, 
  retryLabel = 'Try Again',
  className = '' 
}) => {
  return (
    <div className={`flex flex-col items-center justify-center gap-4 py-8 ${className}`}>
      <AlertTriangle className="w-12 h-12 text-red-500" />
      <p className="text-gray-700 text-center max-w-md">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="primary">
          {retryLabel}
        </Button>
      )}
    </div>
  );
};

export default ErrorState;

