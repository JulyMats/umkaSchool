import { Globe, Sun } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  return (
    <div className="flex flex-col pb-4">
      <div className="flex items-center justify-between">
      <div className="text-left">
        <h1 className="text-2xl font-bold">{title}</h1>
        {subtitle && <p className="text-gray-500">{subtitle}</p>}
      </div>
      <div className="flex gap-4">
        <button className="p-2 hover:bg-gray-100 rounded-lg">
        <Globe className="w-5 h-5 text-gray-600" />
        </button>
        <button className="p-2 hover:bg-gray-100 rounded-lg">
        <Sun className="w-5 h-5 text-gray-600" />
        </button>
      </div>
      </div>
      <hr className="border-t border-gray-200 -mx-6 mt-6" />
    </div>
  );
}

