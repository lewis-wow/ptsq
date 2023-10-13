import type { CorsOptions } from 'cors';
import type { Context, ContextBuilder } from './context';
import type { StaticOrigin, CustomOrigin } from './cors';
import type { Router } from './router';

export type ServeOptions<TContext extends Context> = {
  contextBuilder: ContextBuilder<TContext>;
  introspection?: StaticOrigin | CustomOrigin;
  cors?: CorsOptions;
};

export class Serve<TContext extends Context = Context> {
  contextBuilder: ContextBuilder<TContext>;
  introspection?: StaticOrigin | CustomOrigin;
  cors?: CorsOptions;
  router?: Router;

  constructor({ contextBuilder, introspection, cors }: ServeOptions<TContext>) {
    this.contextBuilder = contextBuilder;
    this.introspection = introspection;
    this.cors = cors;
  }

  adapter({ router }: { router: Router }) {
    this.router = router;
    return this;
  }

  async serve<TParams extends any[]>({ route, params }: { route: string; params: TParams }) {
    if (!this.router) throw new Error('Router must be set by Serve.prepareAdapter before serve the server');

    const ctx = await this.contextBuilder(...params);
    const parsedRoute = route.split('.');

    return {
      ctx,
      route: parsedRoute,
    };
  }
}
