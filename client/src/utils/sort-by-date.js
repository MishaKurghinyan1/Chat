export const sortByDate = (messages) => {
  if (!messages) return [];
  return messages.sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
};
