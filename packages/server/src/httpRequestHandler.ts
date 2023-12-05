import { createServerAdapter } from '@whatwg-node/server';
import type { Context, ContextBuilder } from './context';
import type { AnyRouter } from './router';
import { serve } from './serve';

export const createHTTPRequestHandler = <TContext extends Context>(options: {
  contextBuilder: ContextBuilder<TContext>;
  router: AnyRouter;
}) => {
  return createServerAdapter<TContext>(async (req, ctx) => {
    const jsonBody = await req.json();

    const callResponse = await serve({
      router: options.router,
      body: jsonBody,
      params: options.ctx,
      contextBuilder,
    });

    return callResponse.toResponse();
  });
};
