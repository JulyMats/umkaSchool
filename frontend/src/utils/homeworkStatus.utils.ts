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
      return 'text-green-600 bg-green-50';
    case 'overdue':
      return 'text-red-600 bg-red-50';
    default:
      return 'text-yellow-600 bg-yellow-50';
  }
};

