import { ptsq } from '@ptsq/server';
import { createContext } from './context';

export const { resolver, router, serve } = ptsq({
  ctx: createContext,
}).create();
