import { router } from '../../ptsq';
import { createUser } from './createUser';
import { deleteUser } from './deleteUser';

export const userRouter = router({
  create: createUser,
  delete: deleteUser,
});
