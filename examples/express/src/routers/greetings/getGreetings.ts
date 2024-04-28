import { Type } from '@ptsq/server';
import { publicResolver } from '../../resolvers/publicResolver';

export const getGreetings = publicResolver
  .args(
    Type.Object({
      firstName: Type.String({
        minLength: 4,
      }),
      lastName: Type.Optional(Type.String()),
    }),
  )
  .output(Type.String())
  .query(({ input }) => {
    return `Hello, ${input.firstName}${input.lastName ? ` ${input.lastName}` : ''}`;
  });
