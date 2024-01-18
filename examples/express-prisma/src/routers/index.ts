import { router } from '../ptsq';
import { postRouter } from './post';
import { userRouter } from './user';

export const baseRouter = router({
  user: userRouter,
  post: postRouter,
});
