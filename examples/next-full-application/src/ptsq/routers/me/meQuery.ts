import { loggedInResolver } from '@/ptsq/resolvers/loggedInResolver';
import { UserSchema } from '@/validation';

export const meQuery = loggedInResolver.output(UserSchema).query(({ ctx }) => {
  const user = ctx.session.user;

  return {
    id: user.id,
    name: user.name ?? null,
    email: user?.email ?? null,
    image: user?.image ?? null,
  };
});
