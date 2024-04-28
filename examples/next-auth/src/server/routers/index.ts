import { router } from '../ptsq';
import { postRouter } from './post';

export const baseRouter = router({
  post: postRouter,
});

export type BaseRouter = typeof baseRouter;
