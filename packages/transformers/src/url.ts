import { Transformer } from '@ptsq/server';

/**
 * Vanillajs URL object
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/URL
 */
export const URLTransformer = new Transformer(
  (value: string | URL) => new URL(value),
);
