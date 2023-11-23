import { Transformer } from '@ptsq/server';

export type CurrencyTransformerInput = number;
export type CurrencyTransformerOutput = string;

export const currencyTransformer = new Transformer<
  'ISO 4217 currencies',
  CurrencyTransformerInput,
  CurrencyTransformerOutput
>((value) => {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });

  return formatter.format(value);
});
