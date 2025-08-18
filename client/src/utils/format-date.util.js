export const dateToString = (date) => {
  const d = date instanceof Date ? date : new Date(date);
  d;
  const formattedDate = `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}-${d.getHours()}:${d.getMinutes()}`;
  return formattedDate;
};
