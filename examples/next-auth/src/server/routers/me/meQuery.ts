import { loggedInResolver } from '@/server/resolvers/loggedInResolver';
import { UserSchema } from '@/validation';

export const meQuery = loggedInResolver.output(UserSchema).query(({ ctx }) => {
  return {
    name: ctx.session.user?.name ?? undefined,
    email: ctx.session.user?.email ?? undefined,
    image: ctx.session.user?.image ?? undefined,
  };
});
