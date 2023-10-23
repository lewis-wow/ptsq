import type { Context, ContextBuilder } from './context';
import type { CORSOptions } from './cors';
import type { Router } from './router';

export type ServeOptions<TContext extends Context> = {
  contextBuilder: ContextBuilder<TContext>;
  cors?: CORSOptions;
};

export class Serve<TContext extends Context = Context> {
  contextBuilder: ContextBuilder<TContext>;
  cors?: CORSOptions;
  router?: Router;

  constructor({ contextBuilder, cors }: ServeOptions<TContext>) {
    this.contextBuilder = contextBuilder;
    this.cors = cors;
  }

  adapter({ router }: { router: Router }) {
    this.router = router;
    return this;
  }

  async serve<TParams>({ route, params }: { route: string; params: TParams }) {
    if (!this.router) throw new Error('Router must be set by Serve.adapter before serve the server');

    const ctx = await this.contextBuilder(params);
    const parsedRoute = route.split('.');

    return {
      ctx,
      route: parsedRoute,
    };
  }
}
