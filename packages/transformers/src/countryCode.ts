import lookup from 'country-code-lookup';

/**
 * Country code ISO 3166 string (2-3 digits) or number into country details object
 *
 * @see https://en.wikipedia.org/wiki/ISO_3166
 * @see https://www.npmjs.com/package/country-code-lookup
 */
export const countryCode = (value: string | number) => lookup.byIso(value);
