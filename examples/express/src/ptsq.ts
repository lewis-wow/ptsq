import { PtsqServer } from '@ptsq/server';
import { createContext } from './context';

export const { resolver, router, serve } = PtsqServer.init({
  ctx: createContext,
}).create();
