import type { ClientRoute } from './clientRoute';
import type { RouteInput } from './routeInput';
import type { RouteOutput } from './routeOutput';

export type ClientResolver<TRoute extends ClientRoute> = TRoute extends ClientRoute<'query'>
  ? {
      query: 'input' extends keyof TRoute
        ? (input: RouteInput<TRoute['input']>) => RouteOutput<TRoute['output']>
        : () => RouteOutput<TRoute['output']>;
    }
  : TRoute extends ClientRoute<'mutation'>
  ? {
      mutate: 'input' extends keyof TRoute
        ? (input: RouteInput<TRoute['input']>) => RouteOutput<TRoute['output']>
        : () => RouteOutput<TRoute['output']>;
    }
  : never;
