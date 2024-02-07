import { router } from '../ptsq';
import { createPost } from '../routes/createPost';
import { deletePost } from '../routes/deletePost';
import { listPosts } from '../routes/listPosts';
import { updatePost } from '../routes/updatePost';

export const postRouter = router({
  create: createPost,
  delete: deletePost,
  update: updatePost,
  list: listPosts,
});
