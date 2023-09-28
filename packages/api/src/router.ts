import { z } from 'zod';
import { ResolverType, Router, RouterNode } from './types';

export const router = <
  TType extends ResolverType,
  TInput extends z.Schema | undefined,
  TOutput extends z.Schema | undefined,
  TRoutes extends { [key: string]: RouterNode<TType, TInput, TOutput> },
>(
  routes: TRoutes
): Router<TRoutes> => ({
  routes,
  nodeType: 'router',
});
