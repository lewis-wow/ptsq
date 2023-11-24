/**
 * Vanillajs BigInt object
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt
 */
export const bigInt = (value: string | number | bigint | boolean) =>
  BigInt(value);
