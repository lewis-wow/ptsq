import { router } from '../ptsq';
import { createPost } from '../routes/createPost';
import { listPosts } from '../routes/listPosts';

export const postRouter = router({
  create: createPost,
  list: listPosts,
});
