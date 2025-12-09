import React from 'react';

interface AvatarSelectorProps {
  value: string;
  onChange: (avatarUrl: string) => void;
  options?: string[];
  label?: string;
  disabled?: boolean;
  layout?: 'grid' | 'flex';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const DEFAULT_AVATAR_OPTIONS = [
  '/avatars/student1.png',
  '/avatars/student2.png',
  '/avatars/student3.png',
  '/avatars/student4.png',
  '/avatars/student5.png',
  '/avatars/student6.png',
  '/avatars/student7.png',
  '/avatars/student8.png'
];

const AvatarSelector: React.FC<AvatarSelectorProps> = ({
  value,
  onChange,
  options = DEFAULT_AVATAR_OPTIONS,
  label = 'Choose Your Avatar',
  disabled = false,
  layout = 'grid',
  size = 'md',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-16 h-16 rounded-xl',
    md: 'aspect-square rounded-2xl',
    lg: 'aspect-square rounded-2xl'
  };

  const gridCols = {
    sm: 'grid-cols-4',
    md: 'grid-cols-4',
    lg: 'grid-cols-4'
  };

  const ringSize = {
    sm: 'ring-2',
    md: 'ring-4',
    lg: 'ring-4'
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {label && (
        <label className="block text-base font-medium text-gray-900 mb-6">
          {label}
        </label>
      )}
      <div className={layout === 'grid' 
        ? `grid ${gridCols[size]} gap-4` 
        : 'flex flex-wrap items-center justify-center gap-3'
      }>
        {options.map((avatar) => (
          <button
            key={avatar}
            type="button"
            onClick={() => !disabled && onChange(avatar)}
            disabled={disabled}
            className={`relative ${sizeClasses[size]} overflow-hidden transition-all duration-200
              ${value === avatar
                ? `${ringSize[size]} ring-pink-400 ring-offset-2 scale-105`
                : 'ring-1 ring-gray-200 hover:ring-pink-300 hover:scale-[1.02]'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
            aria-label={`Select avatar ${avatar}`}
            aria-pressed={value === avatar}
          >
            <img
              src={avatar}
              alt="Avatar"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/avatars/student1.png';
              }}
            />
            {value === avatar && (
              <div className="absolute inset-0 bg-pink-400/10 flex items-center justify-center">
                <span className="text-2xl">✓</span>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AvatarSelector;

