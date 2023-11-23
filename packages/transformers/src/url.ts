import { Transformer } from '@ptsq/server';

export type URLTransformerInput = string | URL;
export type URLTransformerOutput = URL;

export const URLTransformer = new Transformer<
  'URL DOM class',
  URLTransformerInput,
  URLTransformerOutput
>((value) => new URL(value));
