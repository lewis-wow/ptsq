import { router } from '../ptsq';
import { userRouter } from './user';

export const baseRouter = router({
  user: userRouter,
});

export type BaseRouter = typeof baseRouter;
