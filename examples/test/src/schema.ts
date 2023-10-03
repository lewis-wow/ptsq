import { app } from '@schema-rpc/schema';
import superjson from 'superjson';

export type User = {
  email: string;
  id: string;
  password: string;
  createdAt: Date;
};

const { router, query } = app({
  transformer: superjson,
});

export const baseRouter = router({
  test: query(),
});
