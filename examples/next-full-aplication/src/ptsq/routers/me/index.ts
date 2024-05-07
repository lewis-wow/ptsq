import { router } from '../..';
import { meQuery } from './meQuery';

export const meRouter = router({
  get: meQuery,
});
