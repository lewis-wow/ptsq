/**
 * Removes key from the object
 *
 * @example
 * ```ts
 * const init = { a: 1, b: 2 };
 * const next = removeKey({ object: init, key: 'a' }); // { b: 2 }
 * ```
 */
export const removeKey = <
  TObject extends Record<string | number | symbol, any>,
>(value: {
  object: TObject;
  key: keyof TObject;
}) => {
  const { [value.key]: _valueToRemove, ...rest } = value.object;

  return rest;
};
