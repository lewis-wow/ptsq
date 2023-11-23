import { Transformer } from '@ptsq/server';

/**
 * Vanillajs Date object
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date
 */
export const dateTransformer = new Transformer(
  (value: string | number | Date) => new Date(value),
);
