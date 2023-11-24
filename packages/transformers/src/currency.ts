/**
 * ISO 4217 currencies
 *
 * @see https://en.wikipedia.org/wiki/ISO_4217
 */
export const currencyTransformer = (value: number) => {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });

  return formatter.format(value);
};
