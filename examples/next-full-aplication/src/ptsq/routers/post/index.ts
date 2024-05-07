import { router } from '../..';
import { createPost } from './createPost';
import { deletePost } from './deletePost';
import { getPost } from './getPost';
import { listPosts } from './listPosts';
import { updatePost } from './updatePost';

export const postRouter = router({
  create: createPost,
  delete: deletePost,
  update: updatePost,
  list: listPosts,
  get: getPost,
});
