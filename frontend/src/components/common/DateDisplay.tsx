import { formatDate, getRelativeTime, isToday } from '../../utils/date.utils';

interface DateDisplayProps {
  date: string | Date;
  format?: 'short' | 'long' | 'relative' | 'datetime';
  showTime?: boolean;
  className?: string;
}

const DateDisplay: React.FC<DateDisplayProps> = ({ 
  date, 
  format = 'short',
  showTime = false,
  className = '' 
}) => {
  let displayText: string;

  if (format === 'relative') {
    displayText = getRelativeTime(date);
  } else if (format === 'long') {
    displayText = formatDate(date, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      ...(showTime && { hour: '2-digit', minute: '2-digit' })
    });
  } else if (format === 'datetime') {
    displayText = formatDate(date, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } else {
    // short format
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isToday(dateObj)) {
      displayText = 'Today';
    } else {
      displayText = formatDate(date, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
  }

  return <span className={className}>{displayText}</span>;
};

export default DateDisplay;

