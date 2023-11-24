/**
 * Vanillajs RegExp object
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp
 */
export const regexTransformer = (
  value: string | RegExp | { pattern: string | RegExp; flags?: string },
) =>
  typeof value === 'object' && !(value instanceof RegExp)
    ? new RegExp(value.pattern, value.flags)
    : new RegExp(value);
