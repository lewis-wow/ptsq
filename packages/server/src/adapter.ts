import type { Context } from './context';
import type { CORSOptions } from './cors';
import { HTTPError } from './httpError';
import { requestBodySchema } from './requestBodySchema';
import type { Serve } from './serve';

type AdapterIntrospectionHandler = () => object;

type AdapterServerHandler<TAdapterServerHandlerParams> = (args: {
  body: unknown;
  params: TAdapterServerHandlerParams;
}) => Promise<unknown>;

type AdapterHandler<TAdapterServerHandlerParams extends Context, TAdapterHandlerReturnType> = (args: {
  handler: {
    introspection: AdapterIntrospectionHandler;
    server: AdapterServerHandler<TAdapterServerHandlerParams>;
  };
  options: {
    cors?: CORSOptions;
  };
}) => TAdapterHandlerReturnType;

export const Adapter =
  <TAdapterServerHandlerParams extends Context, TAdapterHandlerReturnType>(
    adapterHandler: AdapterHandler<TAdapterServerHandlerParams, TAdapterHandlerReturnType>
  ) =>
  (serve: Serve) => {
    const introspectionAdapterHandler = () => {
      if (serve.router === undefined) throw new Error('Router must be set when calling serve.');

      return serve.router.getJsonSchema();
    };

    const serverAdapterHandler = async ({ body, params }: { body: unknown; params: object }): Promise<unknown> => {
      if (serve.router === undefined) throw new Error('Router must be set when calling serve.');

      const parsedRequestBody = requestBodySchema.safeParse(body);

      if (!parsedRequestBody.success)
        throw new HTTPError({
          code: 'BAD_REQUEST',
          message: 'Route query param must be a string separated by dots (a.b.c)',
          info: parsedRequestBody.error,
        });

      const input = parsedRequestBody.data.input;

      const { ctx, route } = await serve.serve({
        route: parsedRequestBody.data.route,
        params,
      });

      const dataResult = await serve.router.call({
        route,
        input,
        ctx,
      });

      return dataResult;
    };

    return adapterHandler({
      handler: {
        introspection: introspectionAdapterHandler,
        server: serverAdapterHandler,
      },
      options: {
        cors: serve.cors,
      },
    });
  };
