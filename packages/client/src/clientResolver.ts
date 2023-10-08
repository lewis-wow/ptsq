import type { ClientRoute } from './clientRoute';
import type { RouteInput } from './routeInput';
import type { RouteOutput } from './routeOutput';

export type ResolveFunction<TRoute extends ClientRoute> = 'input' extends keyof TRoute
  ? TRoute['input'] extends void
    ? () => RouteOutput<TRoute['output']>
    : (input: RouteInput<TRoute['input']>) => RouteOutput<TRoute['output']>
  : () => RouteOutput<TRoute['output']>;

export type ClientResolver<TRoute extends ClientRoute> = TRoute extends ClientRoute<'query'>
  ? {
      query: ResolveFunction<TRoute>;
    }
  : TRoute extends ClientRoute<'mutation'>
  ? {
      mutate: ResolveFunction<TRoute>;
    }
  : never;
