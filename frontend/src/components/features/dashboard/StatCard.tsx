import React from "react";

interface StatCardProps {
  icon?: React.ReactNode;
  title: string;
  value: string | number;
  progress: number; 
  subtitle: string;
  color?: string; 
}

const StatCard: React.FC<StatCardProps> = ({
  icon,
  title,
  value,
  progress,
  subtitle,
  color = "pink",
}) => {
  const progressColor = {
    pink: "bg-pink-400",
    blue: "bg-blue-500",
    purple: "bg-purple-500",
  }[color];

  const iconColor = {
    pink: "text-pink-500",
    blue: "text-blue-500",
    purple: "text-purple-500",
  }[color];

  const iconBgColor = {
    pink: "bg-pink-100",
    blue: "bg-blue-100",
    purple: "bg-purple-100",
  }[color];

  return (
    <div className="bg-gray-100 dark:bg-gray-800 p-5 rounded-2xl shadow-sm">
      <div className="flex items-center gap-4">
        {icon && <div className={`${iconBgColor} dark:opacity-80 ${iconColor} p-2 rounded-full flex-shrink-0`}>{icon}</div>}
        <div className="flex-1">
          <h3 className={`text-lg font-semibold ${iconColor} mb-2`}>{title}</h3>
          <p className="text-3xl font-bold mb-3 text-gray-900 dark:text-gray-100">{value}</p>
        </div>
      </div>

      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          className={`${progressColor} h-2 rounded-full transition-all duration-300`}
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{subtitle}</p>
    </div>
  );
};

export default StatCard;

