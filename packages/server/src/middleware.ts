import type { Context } from './context';
import type { ResolverResponse } from './resolver';
import type { ResolverRequest } from './resolver';
import { HTTPError } from './httpError';
import type { ResolverArgs } from './resolver';
import type { inferResolverArgs } from './resolver';
import type { ZodObject } from 'zod';

export type NextFunction = <TNextContext extends Context>(
  nextContext: TNextContext
) => Promise<ResolverResponse<TNextContext>>;

export type MiddlewareCallback<
  TArgs extends ResolverArgs,
  TContext extends Context,
  TNextContext extends Context,
> = (options: {
  input: inferResolverArgs<TArgs>;
  meta: ResolverRequest;
  ctx: TContext;
  next: NextFunction;
}) => ReturnType<typeof options.next<TNextContext>>;

export class Middleware<
  TArgs extends ResolverArgs = ResolverArgs,
  TContext extends Context = Context,
  TNextContext extends Context = Context,
> {
  _argsValidationSchema: ZodObject<TArgs>;
  _middlewareCallback: MiddlewareCallback<TArgs, TContext, TNextContext>;

  constructor({
    argsValidationSchema,
    middlewareCallback,
  }: {
    argsValidationSchema: ZodObject<TArgs>;
    middlewareCallback: MiddlewareCallback<TArgs, TContext, TNextContext>;
  }) {
    this._argsValidationSchema = argsValidationSchema;
    this._middlewareCallback = middlewareCallback;
  }

  static async recursiveCall({
    ctx,
    meta,
    index,
    middlewares,
  }: {
    ctx: any;
    meta: ResolverRequest;
    index: number;
    middlewares: Middleware<any, any>[];
  }): Promise<ResolverResponse<any>> {
    try {
      const parseResult = middlewares[index]._argsValidationSchema.safeParse(meta.input);

      if (!parseResult.success)
        throw new HTTPError({ code: 'BAD_REQUEST', message: 'Args validation error.', info: parseResult.error });

      return await middlewares[index]._middlewareCallback({
        input: parseResult.data,
        meta,
        ctx,
        next: async (nextContext): Promise<ResolverResponse<any>> => {
          return await Middleware.recursiveCall({
            ctx: nextContext,
            meta,
            index: index + 1,
            middlewares,
          });
        },
      });
    } catch (error) {
      if (HTTPError.isHttpError(error))
        return {
          ok: false,
          error,
          ctx,
        };

      // rethrow original error
      throw error;
    }
  }
}
