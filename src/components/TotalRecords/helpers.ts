import { intervalToDuration } from 'date-fns';
import type { IRecord } from '../../context/app.context';

export const formatTotal = (records: IRecord[]) => {
  if (records.length === 0) {
    return '0 files. 0 minutes';
  }

  const totalSeconds = records.reduce(
    (sum, record) => sum + record.duration,
    0,
  );

  const { hours = 0, minutes: totalMinutes = 0 } = intervalToDuration({
    start: 0,
    end: totalSeconds * 1000,
  });

  console.log(hours, totalMinutes);

  const minutes = Math.max(totalMinutes, 1);

  const fileCount = records.length;
  const fileText = fileCount === 1 ? 'file' : 'files';

  if (hours > 0) {
    const hourText = hours === 1 ? 'hour' : 'hours';
    const minuteText = minutes === 1 ? 'minute' : 'minutes';

    return `${fileCount} ${fileText}. ${hours} ${hourText} ${minutes} ${minuteText}`;
  } else {
    const minuteText = minutes === 1 ? 'minute' : 'minutes';

    return `${fileCount} ${fileText}. ${minutes} ${minuteText}`;
  }
};
