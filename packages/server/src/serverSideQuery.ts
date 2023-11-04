import type { z } from 'zod';
import type { Context } from './context';
import type { Query } from './query';

export class ServerSideQuery<TQuery extends Query, TServerSideContext extends Context = Context> {
  ctx: TServerSideContext;
  _query: TQuery;
  _route: string[];

  constructor({ query, ctx, route }: { query: TQuery; ctx: TServerSideContext; route: string[] }) {
    this.ctx = ctx;
    this._query = query;
    this._route = route;
  }

  async query(input: z.output<TQuery['inputValidationSchema']>) {
    return await this._query.call({ meta: { input, route: this._route.join('.') }, ctx: this.ctx });
  }
}
