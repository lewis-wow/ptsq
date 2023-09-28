import { z } from 'zod';
import { ResolverType, Router } from './types';

export const router = <
  TType extends ResolverType,
  TInput extends z.Schema | undefined,
  TOutput extends z.Schema | undefined,
  TRouter extends Router<TType, TInput, TOutput>,
>(
  router: TRouter
) => router;
