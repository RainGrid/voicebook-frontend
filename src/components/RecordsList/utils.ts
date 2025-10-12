import { format, isToday, isYesterday } from 'date-fns';

export const formatTime = (duration: number) => {
  const hours = Math.floor(duration / 3600);
  const minutes = Math.floor((duration % 3600) / 60);
  const seconds = Math.floor(duration % 60);

  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  return `${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}`;
};

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
