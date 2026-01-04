import React from 'react';
import { SearchX } from 'lucide-react';

interface EmptySearchResultsProps {
  searchQuery: string;
  onClear?: () => void;
  className?: string;
}

const EmptySearchResults: React.FC<EmptySearchResultsProps> = ({
  searchQuery,
  onClear,
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
      <SearchX className="w-16 h-16 text-gray-400 dark:text-gray-500 mb-4" />
      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
        No exercises found
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-4">
        We couldn't find any exercises matching "{searchQuery}"
      </p>
      {onClear && (
        <button
          onClick={onClear}
          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium hover:underline"
        >
          Clear search
        </button>
      )}
    </div>
  );
};

export default EmptySearchResults;

