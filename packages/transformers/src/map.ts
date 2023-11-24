/**
 * Vanillajs Map object
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
 */
export const map = <TKey, TValue>(value: [TKey, TValue][]) =>
  new Map<TKey, TValue>(value);
