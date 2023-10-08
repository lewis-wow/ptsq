import { ContextBuilder, inferContextParamsFromContextBuilder } from './context';
import { Router } from './createRouterFactory';
import { MaybePromise } from './types';

export type Serve<TParams extends any[] = any[]> = ({ router }: { router: Router }) => ServeFunction<TParams>;

export type ServeFunction<TParams extends any[] = any[]> = (options: {
  route?: string;
  params: TParams;
}) => MaybePromise<{
  router: Router;
  params: TParams;
  route?: string[];
  ctx: object;
  introspection: boolean;
}>;

export type AnyServe = Serve;
export type AnyServeFunction = ServeFunction;

export const createServeFactory =
  <TContextBuilder extends ContextBuilder>({
    contextBuilder,
    introspection,
  }: {
    contextBuilder: TContextBuilder;
    introspection: boolean;
  }): Serve<inferContextParamsFromContextBuilder<TContextBuilder>> =>
  ({ router }) =>
  async ({ route, params }) => {
    const ctx = await contextBuilder(...params);
    const parsedRoute = route?.split('.');

    return {
      ctx,
      router,
      route: parsedRoute,
      params,
      introspection,
    };
  };
