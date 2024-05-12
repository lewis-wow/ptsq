import { router } from '..';
import { meRouter } from './me';
import { postRouter } from './post';
import { signin } from './signin';
import { signup } from './signup';

export const baseRouter = router({
  me: meRouter,
  post: postRouter,
  signin: signin,
  signup: signup,
});

export type BaseRouter = typeof baseRouter;
