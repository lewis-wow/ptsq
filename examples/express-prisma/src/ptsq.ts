import { PtsqServer } from '@ptsq/server';
import { createContext } from './context';

export const { router, resolver, serve } = PtsqServer.init({
  ctx: createContext,
}).create();
