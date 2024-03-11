import { TSchema } from '@sinclair/typebox';
import type { Context } from './context';
import { JsonSchemaParser } from './jsonSchemaParser';
import { AnyPtsqErrorTemplate, PtsqError } from './ptsqError';
import { ShallowMerge } from './types';
import type { ResolverType, Simplify } from './types';

/**
 * @internal
 */
export type NextFunction<TContext extends Context> = {
  (): Promise<MiddlewareResponse<TContext>>;

  <TNextContext extends Context | undefined = undefined>(options?: {
    ctx?: TNextContext;
    meta?: MiddlewareMeta;
  }): Promise<
    MiddlewareResponse<
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
  TContext extends Context,
  TErrors extends Record<string, number>,
> = (options: {
  input: TArgs;
  meta: MiddlewareMeta;
  ctx: TContext;
  next: NextFunction<TContext>;
  PtsqError: (options: {
    code: keyof TErrors;
    message?: string;
    cause?: unknown;
  }) => PtsqError;
}) => ReturnType<NextFunction<TContext>>;

/**
 * @internal
 */
export type AnyMiddlewareFunction = MiddlewareFunction<
  unknown,
  Context,
  Record<string, number>
>;

export type MiddlewareMeta = {
  input: unknown;
  route: string;
  type: ResolverType;
};

/**
 * The middleware class container
 */
export class Middleware<
  TArgs,
  TContext extends Context,
  TErrors extends Record<string, number>,
> {
  _def: {
    middlewareFunction: MiddlewareFunction<TArgs, TContext, TErrors>;
    argsSchema: TSchema | undefined;
    parser: JsonSchemaParser;
    errors: TErrors;
  };

  constructor(middlewareOptions: {
    argsSchema: TSchema | undefined;
    middlewareFunction: MiddlewareFunction<TArgs, TContext, TErrors>;
    parser: JsonSchemaParser;
    errors: TErrors;
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
          throw new PtsqError({
            code: 'VALIDATION_FAILED',
            message: 'Args validation error.',
            cause: parseResult.errors,
            httpStatus: 400,
          });

        middlewareInput = parseResult.data;
      }

      const response = await middlewares[index]._def.middlewareFunction({
        input: middlewareInput,
        meta: meta,
        ctx: ctx,
        PtsqError: (options) =>
          new PtsqError({
            ...options,
            httpStatus: middlewares[index]._def.errors[options.code],
          }),
        next: ((options) => {
          return Middleware.recursiveCall({
            ctx: { ...ctx, ...options?.ctx },
            meta: options?.meta ?? meta,
            index: index + 1,
            middlewares: middlewares,
          });
        }) as NextFunction<Context>,
      });

      return response;
    } catch (error) {
      return Middleware.createFailureResponse({
        error: PtsqError.isPtsqError(error)
          ? error
          : new PtsqError({
              code: 'INTERNAL_SERVER_ERROR',
              cause: error,
              httpStatus: 500,
            }),
      });
    }
  }

  /**
   * Creates a success response with correct structure
   */
  static createSuccessResponse<
    TContext extends object = object,
  >(responseFragment: { data: unknown }): MiddlewareResponse<TContext> {
    return {
      ok: true,
      ...responseFragment,
    };
  }

  /**
   * Creates a failure response with correct structure
   */
  static createFailureResponse<
    TContext extends object = object,
  >(responseFragment: { error: PtsqError }): MiddlewareResponse<TContext> {
    return {
      ok: false,
      ...responseFragment,
    };
  }
}

export type AnyMiddleware = Middleware<
  unknown,
  Context,
  Record<string, number>
>;

/**
 * @internal
 */
interface MiddlewareOkResponse<_Tcontext extends Context> {
  ok: true;
  data: unknown;
}

/**
 * @internal
 */
interface MiddlewareErrorResponse<_Tcontext extends Context> {
  ok: false;
  error: PtsqError;
}

export type MiddlewareResponse<_TContext extends Context> =
  | MiddlewareOkResponse<_TContext>
  | MiddlewareErrorResponse<_TContext>;

export type AnyMiddlewareResponse = MiddlewareResponse<Context>;

/**
 * @internal
 */
export type inferContextFromMiddlewareResponse<TMiddlewareResponse> =
  TMiddlewareResponse extends MiddlewareResponse<infer iContext>
    ? iContext
    : never;

/**
 * @internal
 */
class StandaloneMiddlewareBuilder<
  TArgs,
  TContext extends Context,
  TErrors extends Record<string, number>,
> {
  _def: {
    errors: TErrors;
  };

  constructor(options: { errors: TErrors }) {
    this._def = options;
  }

  canThrow<const TPtsqErrorTemplate extends AnyPtsqErrorTemplate>(
    ptsqErrorTemplate: TPtsqErrorTemplate,
  ) {
    return new StandaloneMiddlewareBuilder<
      TArgs,
      TContext,
      Simplify<
        TErrors & {
          [key in TPtsqErrorTemplate['code']]: TPtsqErrorTemplate['httpStatus'];
        }
      >
    >({
      errors: {
        ...this._def.errors,
        [ptsqErrorTemplate.code]: ptsqErrorTemplate.httpStatus,
      },
    });
  }

  create<
    TMiddlewareFunction extends MiddlewareFunction<TArgs, TContext, TErrors>,
  >(middlewareFunction: TMiddlewareFunction) {
    return middlewareFunction;
  }
}

/**
 * @internal
 */
type StandaloneMiddlewareBuilderFunction = {
  (): StandaloneMiddlewareBuilder<unknown, Context, {}>;

  <
    TMiddlewareOptions extends {
      ctx: Context;
    },
  >(): StandaloneMiddlewareBuilder<unknown, TMiddlewareOptions['ctx'], {}>;

  <
    TMiddlewareOptions extends {
      input: unknown;
    },
  >(): StandaloneMiddlewareBuilder<TMiddlewareOptions['input'], Context, {}>;

  <
    TMiddlewareOptions extends {
      ctx: Context;
      input: unknown;
    },
  >(): StandaloneMiddlewareBuilder<
    TMiddlewareOptions['input'],
    TMiddlewareOptions['ctx'],
    {}
  >;
};

/**
 * Creates standalone middleware
 */
export const middleware: StandaloneMiddlewareBuilderFunction = () =>
  new StandaloneMiddlewareBuilder({ errors: {} });
