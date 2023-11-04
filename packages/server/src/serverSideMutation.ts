import type { z } from 'zod';
import type { Context } from './context';
import type { Mutation } from './mutation';

export class ServerSideMutation<TMutation extends Mutation, TServerSideContext extends Context = Context> {
  ctx: TServerSideContext;
  _mutation: TMutation;
  _route: string[];

  constructor({ mutation, ctx, route }: { mutation: TMutation; ctx: TServerSideContext; route: string[] }) {
    this.ctx = ctx;
    this._mutation = mutation;
    this._route = route;
  }

  async mutate(input: z.output<TMutation['inputValidationSchema']>) {
    return await this._mutation.call({ meta: { input, route: this._route.join('.') }, ctx: this.ctx });
  }
}
