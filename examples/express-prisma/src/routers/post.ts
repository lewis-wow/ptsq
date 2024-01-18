import { router } from '../ptsq';
import { createPost } from '../routes/createPost';
import { deletePost } from '../routes/deletePost';

export const postRouter = router({
  create: createPost,
  delete: deletePost,
});
