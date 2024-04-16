import { router } from '../ptsq';
import { getGreetings } from './query/getGreetings';

export const greetingsRouter = router({
  getGreetings: getGreetings,
});
