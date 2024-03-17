export const omitUndefinedProperties = (obj: object): object => {
  const objCopy: Record<string, unknown> = { ...obj };

  Object.keys(objCopy).forEach(
    (key) => objCopy[key] === undefined && delete objCopy[key],
  );

  return objCopy;
};
