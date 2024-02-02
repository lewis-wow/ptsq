import { api } from '@/api';

export default function Home() {
  const listPostsQuery = api.post.list.useQuery();
  const createPostMutation = api.post.create.useMutation();

  if (listPostsQuery.isFetching) return <p>Loading...</p>;

  return (
    <main>
      <button
        onClick={() =>
          createPostMutation.mutate({
            title: 'Test',
            published: false,
          })
        }
      >
        Create post
      </button>
      <ul>
        {listPostsQuery.data?.map((post) => (
          <li key={post.id}>{post.title}</li>
        ))}
      </ul>
    </main>
  );
}
