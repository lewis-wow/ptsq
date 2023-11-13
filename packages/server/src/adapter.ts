import type { Context } from './context';
import type { CORSOptions } from './cors';
import type { ResolverResponse } from './resolver';
import type { Serve } from './serve';

type AdapterIntrospectionHandler = () => object;

type AdapterServerHandler<TAdapterServerHandlerParams> = (args: {
  body: unknown;
  params: TAdapterServerHandlerParams;
}) => Promise<ResolverResponse<Context>>;

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

    const serverAdapterHandler = async (options: {
      body: unknown;
      params: object;
    }): Promise<ResolverResponse<Context>> => serve.call(options);

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
