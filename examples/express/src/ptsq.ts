import { createServer } from '@ptsq/server';
import { createContext } from './context';

export const { resolver, router, serve } = createServer({
  ctx: createContext,
}).create();
