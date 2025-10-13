import { format, isToday, isYesterday } from 'date-fns';

export const formatDate = (date: string) => {
  const createdAt = new Date(date);

  if (isToday(createdAt)) {
    return `Today ${format(createdAt, 'HH:mm')}`;
  }

  if (isYesterday(createdAt)) {
    return `Yesterday ${format(createdAt, 'HH:mm')}`;
  }

  return format(new Date(date), 'd MMM yyyy');
};
