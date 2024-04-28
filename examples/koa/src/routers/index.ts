import { router } from '../ptsq';
import { greetingsRouter } from './greetings';

export const baseRouter = router({
  greetings: greetingsRouter,
});
