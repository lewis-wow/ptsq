import type { ZodVoid } from 'zod';
import type { Middleware } from './middleware';
import type { ResolveFunction, ResolverArgs, ResolverOutput } from './resolver';
import { Route } from './route';

export class Mutation<
  TArgs extends ResolverArgs | ZodVoid = ResolverArgs | ZodVoid,
  TResolverOutput extends ResolverOutput = ResolverOutput,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TResolveFunction extends ResolveFunction<any, any, any> = ResolveFunction<
    any,
    any,
    any
  >,
> extends Route<'mutation', TArgs, TResolverOutput, TResolveFunction> {
  constructor(options: {
    args: TArgs;
    output: TResolverOutput;
    resolveFunction: TResolveFunction;
    middlewares: Middleware<any, any>[];
  }) {
    super({
      type: 'mutation',
      ...options,
    });
  }
}
