import { Transformer } from './transformer';

export type CoordsTransformerInput = [number, number];
export type CoordsTransformerOutput = { lat: number; lng: number };

export class CoordsTransformer extends Transformer<
  CoordsTransformerInput,
  CoordsTransformerOutput
> {
  parse(value: CoordsTransformerInput): CoordsTransformerOutput {
    return {
      lat: value[0],
      lng: value[1],
    };
  }
}
