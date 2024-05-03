import { router } from '..';
import { meRouter } from './me';

export const baseRouter = router({
  me: meRouter,
});

export type BaseRouter = typeof baseRouter;
