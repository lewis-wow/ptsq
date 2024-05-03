import { Type } from '@ptsq/server';
import { publicResolver } from './publicResolver';

export const paginationResolver = publicResolver.output(
  Type.Object({
    data: Type.Unknown(),
    nextPage: Type.Number(),
  }),
);
