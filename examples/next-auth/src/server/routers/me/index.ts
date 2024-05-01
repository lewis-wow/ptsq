import { router } from '../../ptsq';
import { meQuery } from './meQuery';

export const meRouter = router({
  get: meQuery,
});
