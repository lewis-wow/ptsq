import { router } from '../../ptsq';
import { createUser } from './createUser';
import { deleteUser } from './deleteUser';
import { getUser } from './getUser';
import { listUsers } from './listUsers';
import { updateUser } from './updateUser';

export const userRouter = router({
  create: createUser,
  update: updateUser,
  delete: deleteUser,
  get: getUser,
  list: listUsers,
});
