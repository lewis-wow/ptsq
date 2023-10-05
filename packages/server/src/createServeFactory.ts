import type { ContextBuilder, inferContextParamsFromContextBuilder } from './context';

type ServeArgs<TParams extends unknown[]> = {
  route: string[];
  params: TParams;
};

export type Serve<TParams extends unknown[]> = ({ route, params }: ServeArgs<TParams>) => Promise<void>;

export type AnyServe = Serve<unknown[]>;

export const createServeFactory =
  <TContextBuilder extends ContextBuilder>({
    contextBuilder,
  }: {
    contextBuilder: TContextBuilder;
  }): Serve<inferContextParamsFromContextBuilder<TContextBuilder>> =>
  async ({ route, params }) => {
    const ctx = await contextBuilder(...params);

    console.log(ctx, route, params);
  };
