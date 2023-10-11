import { createProxyClient } from '@schema-rpc/client';
import { BaseRouter } from './server';

const client = createProxyClient<BaseRouter>({
  url: 'http://localhost:4000/schema-rpc',
});

(async () => {
  const result = await client.user.greetings.mutate({ name: 'John' });

  console.log('result: ', result);
})();
