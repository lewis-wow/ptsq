import parseColor from 'parse-color';

/**
 * Transform string into a color
 *
 * @see https://www.npmjs.com/package/parse-color
 */
export const colorTransformer = (value: string) => parseColor(value);
