import { Transformer } from '@ptsq/server';

/**
 * Vanillajs BigInt object
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt
 */
export const bigIntTransformer = new Transformer(
  (value: string | number | bigint | boolean) => BigInt(value),
);
