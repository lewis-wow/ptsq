import { Transformer } from '@ptsq/server';
import parseColor from 'parse-color';

/**
 * Transform string into a color
 *
 * @see https://www.npmjs.com/package/parse-color
 */
export const colorTransformer = new Transformer((value: string) =>
  parseColor(value),
);
