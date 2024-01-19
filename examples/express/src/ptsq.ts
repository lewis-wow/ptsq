import { createServer } from '@ptsq/server';
import { createContext } from './context';

export const { router, resolver, serve } = createServer({
  ctx: createContext,
});
