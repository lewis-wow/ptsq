import { router } from '../ptsq';
import { createUser } from '../routes/createUser';
import { deleteUser } from '../routes/deleteUser';

export const userRouter = router({
  create: createUser,
  delete: deleteUser,
});
