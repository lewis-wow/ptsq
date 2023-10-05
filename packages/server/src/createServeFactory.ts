import { ContextBuilder, inferContextParamsFromContextBuilder } from './context';

type ServeArgs<TParams extends any[]> = {
  route: string[];
  params: TParams;
};

export type Serve<TParams extends any[]> = ({ route, params }: ServeArgs<TParams>) => Promise<void>;

export type AnyServe = Serve<any[]>;

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
