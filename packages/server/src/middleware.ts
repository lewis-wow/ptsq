import { TSchema } from '@sinclair/typebox';
import type { Context } from './context';
import { JsonSchemaParser } from './jsonSchemaParser';
import { AnyPtsqError, PtsqError } from './ptsqError';
import {
  AnyPtsqErrorShape,
  MiddlewareResponse,
  PtsqResponseFunction,
} from './ptsqResponse';
import { ShallowMerge } from './types';
import type { MaybePromise, ResolverType, Simplify } from './types';

/**
 * @internal
 */
export type NextFunction<TOutput, TError, TContext extends Context> = {
  (): Promise<MiddlewareResponse<TOutput, TError, TContext>>;

  <TNextContext extends Context | undefined = undefined>(options?: {
    ctx?: TNextContext;
    meta?: MiddlewareMeta;
  }): Promise<
    MiddlewareResponse<
      TOutput,
      TError,
      Simplify<
        ShallowMerge<
          TContext,
          TNextContext extends Context ? TNextContext : TContext
        >
      >
    >
  >;
};

/**
 * @internal
 */
export type MiddlewareFunction<
  TArgs,
  TOutput,
  TError extends AnyPtsqError,
  TContext extends Context,
> = (options: {
  input: TArgs;
  meta: MiddlewareMeta;
  ctx: TContext;
  next: NextFunction<unknown, AnyPtsqError, TContext>;
  response: PtsqResponseFunction<TOutput, TError>;
}) => MaybePromise<MiddlewareResponse<unknown, AnyPtsqError, TContext>>;

/**
 * @internal
 */
export type AnyMiddlewareFunction = MiddlewareFunction<
  unknown,
  unknown,
  unknown,
  any
>;

export type MiddlewareMeta = {
  input: unknown;
  route: string;
  type: ResolverType;
};

/**
 * The middleware class container
 */
export class Middleware<TArgs, TOutput, TError, TContext extends Context> {
  _def: {
    middlewareFunction: MiddlewareFunction<TArgs, TOutput, TError, TContext>;
    argsSchema: TSchema | undefined;
    parser: JsonSchemaParser;
  };

  constructor(middlewareOptions: {
    argsSchema: TSchema | undefined;
    middlewareFunction: MiddlewareFunction<TArgs, TOutput, TError, TContext>;
    parser: JsonSchemaParser;
  }) {
    this._def = middlewareOptions;
  }

  /**
   * @internal
   *
   * Calls all middlewares recursivelly depends on the `next` function call.
   *
   * The last middleware that is called is always the resolve function.
   */
  static async recursiveCall({
    ctx,
    meta,
    index,
    middlewares,
  }: {
    ctx: Context;
    meta: MiddlewareMeta;
    index: number;
    middlewares: AnyMiddleware[];
  }): Promise<AnyMiddlewareResponse> {
    try {
      const argsSchema = middlewares[index]._def.argsSchema;

      let middlewareInput = meta.input;

      if (argsSchema !== undefined) {
        const parseResult = await middlewares[index]._def.parser.decode({
          value: meta.input,
          schema: argsSchema,
        });

        if (!parseResult.ok)
          return Middleware.createFailureResponse({
            code: 'VALIDATION_FAILED',
            message: 'Args validation error.',
            cause: parseResult.errors,
          });

        middlewareInput = parseResult.data;
      }

      const response = await middlewares[index]._def.middlewareFunction({
        input: middlewareInput,
        meta: meta,
        ctx: ctx,
        next: ((options) => {
          return Middleware.recursiveCall({
            ctx: { ...ctx, ...options?.ctx },
            meta: options?.meta ?? meta,
            index: index + 1,
            middlewares: middlewares,
          });
        }) as NextFunction<unknown, unknown, Context>,
      });

      return response;
    } catch (error) {
      return Middleware.createFailureResponse({
        code: 'INTERNAL_SERVER_ERROR',
        cause: error,
      });
    }
  }
}

export type AnyMiddleware = Middleware<unknown, unknown, unknown, Context>;

/**
 * @internal
 */
export type inferContextFromMiddlewareResponse<TMiddlewareResponse> =
  TMiddlewareResponse extends MiddlewareResponse<any, any, infer iContext>
    ? iContext
    : never;

/**
 * @internal
 */
class StandaloneMiddlewareBuilder<
  TArgs,
  TOutput,
  TError,
  TContext extends Context,
> {
  create<
    TNextMiddlewareFunction extends MiddlewareFunction<
      TArgs,
      TOutput,
      TError,
      TContext
    >,
  >(middlewareFunction: TNextMiddlewareFunction) {
    return middlewareFunction;
  }
}

/**
 * @internal
 */
type StandaloneMiddlewareBuilderFunction = {
  (): StandaloneMiddlewareBuilder<unknown, unknown, unknown, Context>;

  <
    TMiddlewareOptions extends {
      ctx: Context;
    },
  >(): StandaloneMiddlewareBuilder<
    unknown,
    unknown,
    unknown,
    TMiddlewareOptions['ctx']
  >;

  <
    TMiddlewareOptions extends {
      input: unknown;
    },
  >(): StandaloneMiddlewareBuilder<
    TMiddlewareOptions['input'],
    unknown,
    unknown,
    Context
  >;

  <
    TMiddlewareOptions extends {
      ctx: Context;
      input: unknown;
    },
  >(): StandaloneMiddlewareBuilder<
    TMiddlewareOptions['input'],
    unknown,
    unknown,
    TMiddlewareOptions['ctx']
  >;
};

/**
 * Creates standalone middleware
 */
export const middleware: StandaloneMiddlewareBuilderFunction = () =>
  new StandaloneMiddlewareBuilder();
