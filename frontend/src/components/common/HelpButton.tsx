import React from 'react';
import { HelpCircle } from 'lucide-react';
import { Button } from '../ui';

interface HelpButtonProps {
  onClick?: () => void;
  label?: string;
  className?: string;
}

const HelpButton: React.FC<HelpButtonProps> = ({
  onClick,
  label = 'Need help with settings?',
  className = ''
}) => {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className={`flex items-center gap-2 ${className}`}
    >
      <HelpCircle className="w-5 h-5" />
      {label}
    </Button>
  );
};

export default HelpButton;

