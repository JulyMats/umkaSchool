export const getChangeText = (current: number, previous: number, label: string): string => {
  const diff = current - previous;
  if (diff > 0) {
    return `+${diff} ${label}`;
  } else if (diff < 0) {
    return `${diff} ${label}`;
  }
  return 'No change';
};

export const parseTimeHours = (timeString: string): number => {
  const match = timeString.match(/(\d+)h/);
  return match ? parseInt(match[1], 10) : 0;
};

