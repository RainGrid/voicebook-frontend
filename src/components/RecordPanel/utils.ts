export const getTimeParts = (duration: number) => {
  const hours = Math.floor(duration / 3600);
  const minutes = Math.floor((duration % 3600) / 60);
  const seconds = Math.floor(duration % 60);

  return {
    hours,
    minutes,
    seconds,
  };
};
