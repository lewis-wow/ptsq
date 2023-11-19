import type { Context } from './context';
import { HTTPError } from './httpError';
import type {
  inferResolverArgs,
  ResolverArgs,
  ResolverRequest,
  ResolverResponse,
} from './resolver';
import type { TransformationCallback } from './transformation';

export type NextFunction = <TNextContext extends Context>(
  nextContext: TNextContext,
) => Promise<ResolverResponse<TNextContext>>;

export type MiddlewareCallback<
  TArgs,
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
  _middlewareCallback: MiddlewareCallback<TArgs, TContext, TNextContext>;
  _schemaArgs: TArgs;
  _transformations: TransformationCallback<any, any, any>[];

  constructor(options: {
    schemaArgs: TArgs;
    transformations: TransformationCallback<any, any, any>[];
    middlewareCallback: MiddlewareCallback<TArgs, TContext, TNextContext>;
  }) {
    this._middlewareCallback = options.middlewareCallback;
    this._schemaArgs = options.schemaArgs;
    this._transformations = options.transformations;
  }

  static createSuccessResponse({
    data,
    ctx,
  }: {
    data: unknown;
    ctx: object;
  }): ResolverResponse<object> {
    return {
      ok: true,
      data,
      ctx,
    };
  }

  static createFailureResponse({
    error,
    ctx,
  }: {
    error: HTTPError;
    ctx: object;
  }): ResolverResponse<object> {
    return {
      ok: false,
      error,
      ctx,
    };
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
    middlewares: Middleware<ResolverArgs, any>[];
  }): Promise<ResolverResponse<any>> {
    try {
      const parsedInput = middlewares[index]._schemaArgs.safeParse(meta.input);

      if (!parsedInput.success)
        throw new HTTPError({
          code: 'BAD_REQUEST',
          message: 'Args validation error.',
          info: parsedInput.error,
        });

      const transformedInputData = middlewares[index]._transformations.reduce(
        (acc, currentTransformation) =>
          currentTransformation({ input: acc, meta, ctx }),
        parsedInput.data,
      );

      return await middlewares[index]._middlewareCallback({
        input: transformedInputData,
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
        return Middleware.createFailureResponse({ ctx, error });

      // rethrow original error
      throw error;
    }
  }
}
