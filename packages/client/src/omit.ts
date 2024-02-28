export const omit = <T extends object, K extends keyof T>(
  obj: T,
  ...keys: K[]
): Omit<T, K> => {
  const _obj = { ...obj };
  keys.forEach((key) => delete _obj[key]);
  return _obj;
};
