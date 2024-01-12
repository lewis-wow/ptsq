export const omit = <T, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> => {
  const result = { ...obj };
  // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
  keys.forEach((key) => delete result[key]);
  return result;
};
