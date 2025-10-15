import React from "react";

interface StatCardProps {
  icon?: React.ReactNode;
  title: string;
  value: string | number;
  progress: number; // percentage 0-100
  subtitle: string;
  color?: string; // Tailwind color prefix (e.g. "pink" or "blue")
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

  return (
    <div className="bg-grayLight p-5 rounded-2xl shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        {icon && <div className="text-gray-500">{icon}</div>}
        <h3 className="text-sm font-semibold text-gray-600">{title}</h3>
      </div>

      <p className="text-3xl font-bold mb-3">{value}</p>

      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`${progressColor} h-2 rounded-full transition-all duration-300`}
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="text-xs text-gray-500 mt-2">{subtitle}</p>
    </div>
  );
};

export default StatCard;
