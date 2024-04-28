import { router } from '../../ptsq';
import { getGreetings } from './getGreetings';

export const greetingsRouter = router({
  get: getGreetings,
});
