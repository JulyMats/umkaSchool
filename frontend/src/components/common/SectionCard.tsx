import React from 'react';
import { LucideIcon } from 'lucide-react';
import EmptyState from './EmptyState';

interface SectionCardProps {
  title: string;
  icon: React.ReactNode | LucideIcon;
  emptyMessage: string;
  children?: React.ReactNode;
  className?: string;
}

const SectionCard: React.FC<SectionCardProps> = ({
  title,
  icon,
  emptyMessage,
  children,
  className = ''
}) => {
  const hasContent = Array.isArray(children)
    ? children.length > 0
    : !!children;

  const isReactNode = React.isValidElement(icon);
  const IconComponent = isReactNode ? null : (icon as LucideIcon);

  return (
    <div className={`bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-6 ${className}`}>
      <div className="flex items-center gap-4 mb-4">
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 flex-shrink-0">
          {isReactNode ? icon : IconComponent && <IconComponent className="w-6 h-6" />}
        </div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
      </div>

      {hasContent && children ? (
        children
      ) : (
        <EmptyState message={emptyMessage} icon={IconComponent || undefined} />
      )}
    </div>
  );
};

export default SectionCard;

