import { HTTPError } from './httpError';
import { requestBodySchema } from './requestBodySchema';
import type { Serve } from './serve';

type AdapterFunction<TReturn> = (options: {
  server: (options: { body: unknown; params: any }) => Promise<{ data: any; error: HTTPError | null }>;
  introspection: () => {
    $schema: string;
    title: string | undefined;
    type: string;
    additionalProperties: boolean;
    properties: object;
    required: string[];
  };
  serve: Serve;
}) => TReturn;

export const adapter =
  <TReturn>(adapterFunction: AdapterFunction<TReturn>) =>
  (serve: Serve) => {
    const introspection = () => {
      if (serve.router === undefined) throw new Error('Router must be set when calling serve.');

      return serve.router.getJsonSchema();
    };

    const server = async ({ body, params }: { body: unknown; params: any }) => {
      if (serve.router === undefined) throw new Error('Router must be set when calling serve.');

      try {
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

        return {
          data: dataResult,
          error: null,
        };
      } catch (error) {
        if (HTTPError.isHttpError(error)) {
          return {
            data: null,
            error,
          };
        }

        throw error;
      }
    };

    return adapterFunction({ server, introspection, serve });
  };
