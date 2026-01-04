import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';

interface NavMenuItemProps {
  icon: LucideIcon;
  label: string;
  path: string;
  onClick?: () => void;
  className?: string;
}

const NavMenuItem: React.FC<NavMenuItemProps> = ({
  icon: Icon,
  label,
  path,
  onClick,
  className = ''
}) => {
  const location = useLocation();
  const isActive = location.pathname === path;

  const baseClasses = 'flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer mb-1 transition-colors';
  const activeClasses = isActive ? 'bg-gray-100 dark:bg-gray-700 font-semibold' : 'hover:bg-gray-50 dark:hover:bg-gray-700';
  const iconClasses = isActive ? 'text-blue-500 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300';
  const textClasses = isActive ? 'text-blue-500 dark:text-blue-400' : 'text-gray-900 dark:text-gray-100';

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <li>
      <Link
        to={path}
        onClick={handleClick}
        className={`${baseClasses} ${activeClasses} ${className}`}
      >
        <Icon size={18} className={iconClasses} />
        <span className={textClasses}>{label}</span>
      </Link>
    </li>
  );
};

export default NavMenuItem;

