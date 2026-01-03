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
        blue: 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300',
        green: 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300',
        red: 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300',
        yellow: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-300',
        purple: 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300'
      };
      return activeColors[color as keyof typeof activeColors] || activeColors.blue;
    }
    
    return 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800';
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

