import { Type } from '@ptsq/server';
import { loggingResolver } from '../resolvers/loggingResolver';

const schema = Type.Object({
  name: Type.String(),
  email: Type.String(),
});

export const test = loggingResolver
  .args(schema)
  .output(schema)
  .mutation(async ({ input: _imnput, ctx }) => {
    const user = await ctx.orm();

    return user;
  });
