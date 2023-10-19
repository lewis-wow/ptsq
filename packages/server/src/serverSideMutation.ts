import type { z } from 'zod';
import type { Context } from './context';
import type { Mutation } from './mutation';

export class ServerSideMutation<TMutation extends Mutation, TServerSideContext extends Context = Context> {
  ctx: TServerSideContext;
  _mutation: TMutation;

  constructor({ mutation, ctx }: { mutation: TMutation; ctx: TServerSideContext }) {
    this.ctx = ctx;
    this._mutation = mutation;
  }

  async mutate(
    input: z.output<TMutation['inputValidationSchema']>
  ): Promise<z.input<TMutation['outputValidationSchema']>> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return await this._mutation.call({ input, ctx: this.ctx });
  }
}
