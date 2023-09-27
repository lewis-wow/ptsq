import { z } from 'zod';
import { HTTPErrorCode } from 'error';

export type Route<TPath extends string> = {
  path: TPath;
  type: 'query' | 'mutation';
  input: z.Schema;
  output?: Partial<Record<keyof HTTPErrorCode | 'SUCCESS', z.Schema>>;
};

export class Router {
  mutation<TPath extends string>(path: TPath, route: Omit<Route<TPath>, 'type' | 'path'>): Route<TPath> {
    return {
      ...route,
      path,
      type: 'mutation',
    };
  }

  query<TPath extends string>(path: TPath, route: Omit<Route<TPath>, 'type' | 'path'>): Route<TPath> {
    return {
      ...route,
      path,
      type: 'query',
    };
  }
}

export const router = new Router();
