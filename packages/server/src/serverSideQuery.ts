import type { Context } from './context';
import type { Query } from './query';
import type { inferResolverArgsInput } from './types';

export class ServerSideQuery<TQuery extends Query, TServerSideContext extends Context = Context> {
  ctx: TServerSideContext;
  _query: TQuery;
  _route: string[];

  constructor({ query, ctx, route }: { query: TQuery; ctx: TServerSideContext; route: string[] }) {
    this.ctx = ctx;
    this._query = query;
    this._route = route;
  }

  async query(input: inferResolverArgsInput<TQuery['args']>) {
    // the condition is not unnecessary, eslint badly infer the type, the type can be void | undefined
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return await this._query.call({ meta: { input: input ?? {}, route: this._route.join('.') }, ctx: this.ctx });
  }
}
