import { router } from '../../ptsq';
import { createPost } from './createPost';
import { deletePost } from './deletePost';

export const postRouter = router({
  create: createPost,
  delete: deletePost,
});
