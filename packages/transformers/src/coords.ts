import { Transformer } from '@ptsq/server';

export type CoordsTransformerInput =
  | [number, number]
  | { lat: number; lng: number };

export type CoordsTransformerOutput = { lat: number; lng: number };

export const coordsTransformer = new Transformer<
  'latitude and longitude',
  CoordsTransformerInput,
  CoordsTransformerOutput
>((value) => (Array.isArray(value) ? { lat: value[0], lng: value[1] } : value));
