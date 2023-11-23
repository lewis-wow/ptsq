import { Transformer } from '@ptsq/server';

export type DateTransformerInput = string | number | Date;
export type DateTransformerOutput = Date;

export const dateTransformer = new Transformer<
  'Date DOM class',
  DateTransformerInput,
  DateTransformerOutput
>((value) => new Date(value));
