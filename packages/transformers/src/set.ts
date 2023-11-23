import { Transformer } from '@ptsq/server';

/**
 * Vanillajs Set object
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set
 */
export const setTransformer = new Transformer(
  <T extends any[]>(value: T) => new Set<T[number]>(value),
);
