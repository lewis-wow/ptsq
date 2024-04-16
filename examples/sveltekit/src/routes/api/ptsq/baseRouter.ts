import { greetingsRouter } from './greetings';
import { router } from './ptsq';

export const baseRouter = router({
  greetings: greetingsRouter,
});

export type BaseRouter = typeof baseRouter;
