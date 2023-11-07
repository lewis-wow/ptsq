import type { Context } from './context';
import type { Mutation } from './mutation';
import type { inferResolverArgsInput } from './types';

export class ServerSideMutation<TMutation extends Mutation, TServerSideContext extends Context = Context> {
  _ctx: TServerSideContext;
  _mutation: TMutation;
  _route: string[];

  constructor({ mutation, ctx, route }: { mutation: TMutation; ctx: TServerSideContext; route: string[] }) {
    this._ctx = ctx;
    this._mutation = mutation;
    this._route = route;
  }

  async mutate(input: inferResolverArgsInput<TMutation['args']>) {
    // the condition is not unnecessary, eslint badly infer the type, the type can be void | undefined
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return await this._mutation.call({ meta: { input: input ?? {}, route: this._route.join('.') }, ctx: this._ctx });
  }
}
