import { router } from '..';
import { meRouter } from './me';
import { postRouter } from './post';

export const baseRouter = router({
  me: meRouter,
  post: postRouter,
});

export type BaseRouter = typeof baseRouter;
