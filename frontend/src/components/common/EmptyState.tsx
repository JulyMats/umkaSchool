import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  message: string;
  icon?: LucideIcon;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  message,
  icon: Icon,
  action,
  className = ''
}) => {
  return (
    <div className={`text-center py-4 ${className}`}>
      {Icon && (
        <Icon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
      )}
      <p className="text-gray-500">{message}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

export default EmptyState;

