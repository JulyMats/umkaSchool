import React from 'react';

export interface FilterOption<T extends string> {
  value: T;
  label: string;
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple';
}

interface FilterTabsProps<T extends string> {
  filters: FilterOption<T>[];
  activeFilter: T;
  onFilterChange: (filter: T) => void;
  className?: string;
}

const FilterTabs = <T extends string>({
  filters,
  activeFilter,
  onFilterChange,
  className = ''
}: FilterTabsProps<T>) => {
  const getColorClasses = (color?: string, isActive: boolean = false) => {
    if (!color) color = 'blue';
    
    if (isActive) {
      const activeColors = {
        blue: 'bg-blue-100 text-blue-600',
        green: 'bg-green-100 text-green-600',
        red: 'bg-red-100 text-red-600',
        yellow: 'bg-yellow-100 text-yellow-600',
        purple: 'bg-purple-100 text-purple-600'
      };
      return activeColors[color as keyof typeof activeColors] || activeColors.blue;
    }
    
    return 'text-gray-600 hover:bg-gray-100';
  };

  return (
    <div className={`flex space-x-2 ${className}`}>
      {filters.map((filter) => (
        <button
          key={filter.value}
          onClick={() => onFilterChange(filter.value)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${getColorClasses(filter.color, activeFilter === filter.value)}`}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
};

export default FilterTabs;

