import { router } from '../ptsq';
import { createPost } from '../routes/createPost';
import { deletePost } from '../routes/deletePost';
import { listPosts } from '../routes/listPosts';

export const postRouter = router({
  create: createPost,
  delete: deletePost,
  list: listPosts,
});
