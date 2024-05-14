import { createProxyClient } from '@ptsq/client';
import type { BaseRouter } from './server';

// import { BaseRouter } from './generated/schema.generated';

const client = createProxyClient<BaseRouter>({
  url: 'http://localhost:4000/ptsq',
});

const main = async () => {
  const user = await client.user.create.mutate({
    email: 'john.doe@example.com',
    name: 'John',
  });

  console.log('New user: ', user);

  const post = await client.post.create.mutate({
    title: 'Random post',
    authorId: user.id,
  });

  console.log('New post: ', post);
};

main().then(() => process.exit());
