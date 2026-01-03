import { Clock, CheckCircle, XCircle } from 'lucide-react';
import { Homework } from '../types/homework';
import { LucideIcon } from 'lucide-react';

export const getStatusIcon = (status: Homework['status']): LucideIcon => {
  switch (status) {
    case 'completed':
      return CheckCircle;
    case 'overdue':
      return XCircle;
    default:
      return Clock;
  }
};

export const getStatusColor = (status: Homework['status']): string => {
  switch (status) {
    case 'completed':
      return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 border-green-300 dark:border-green-700';
    case 'overdue':
      return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 border-red-300 dark:border-red-700';
    default:
      return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700';
  }
};

