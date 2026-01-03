import { Globe, Sun, Moon, Menu } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { userService } from '../../services/user.service';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onMenuClick?: () => void;
  showMenuButton?: boolean;
}

export default function Header({ title, subtitle, onMenuClick, showMenuButton }: HeaderProps) {
  const { user, refreshUserData } = useAuth();
  const [isToggling, setIsToggling] = useState(false);
  const isDarkMode = user?.appTheme === 'DARK';

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleThemeToggle = async () => {
    if (!user || isToggling) return;

    try {
      setIsToggling(true);
      const newTheme = isDarkMode ? 'LIGHT' : 'DARK';
      await userService.updateUser(user.id, { appTheme: newTheme });
      await refreshUserData();
    } catch (error) {
      console.error('Failed to toggle theme:', error);
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <div className="flex flex-col pb-4">
      <div className="flex items-start sm:items-center justify-between gap-4 px-4 sm:px-6 lg:px-6">
        <div className="text-left flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold break-words text-gray-900 dark:text-gray-100">{title}</h1>
          {subtitle && <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 break-words">{subtitle}</p>}
        </div>
        <div className="flex gap-2 sm:gap-4 flex-shrink-0 items-center">
          {showMenuButton && onMenuClick && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onMenuClick();
              }}
              className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg active:bg-gray-200 dark:active:bg-gray-600 transition-colors"
              aria-label="Open menu"
              type="button"
            >
              <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
          )}
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg active:bg-gray-200 dark:active:bg-gray-600 transition-colors" aria-label="Language">
            <Globe className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          <button 
            onClick={handleThemeToggle}
            disabled={isToggling || !user}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg active:bg-gray-200 dark:active:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
            aria-label="Toggle theme"
            type="button"
          >
            {isDarkMode ? (
              <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            ) : (
              <Sun className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            )}
          </button>
        </div>
      </div>
      <hr className="border-t border-gray-200 dark:border-gray-700 mt-6 -mx-4 sm:-mx-6 lg:-mx-6" />
    </div>
  );
}

