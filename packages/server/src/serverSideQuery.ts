import type { z } from 'zod';
import type { Context } from './context';
import type { Query } from './query';

export class ServerSideQuery<TQuery extends Query, TServerSideContext extends Context = Context> {
  ctx: TServerSideContext;
  _query: TQuery;

  constructor({ query, ctx }: { query: TQuery; ctx: TServerSideContext }) {
    this.ctx = ctx;
    this._query = query;
  }

  async query(input: z.output<TQuery['inputValidationSchema']>): Promise<z.input<TQuery['outputValidationSchema']>> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return await this._query.call({ input, ctx: this.ctx });
  }
}
