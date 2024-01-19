import { router } from '../ptsq';
import { test } from '../routes/test';

export const baseRouter = router({
  test: router({
    test: test,
  }),
});
