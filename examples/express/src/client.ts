import { createProxyClient } from '@schema-rpc/client';
//import { BaseRouter } from './server';
import { RootRouter } from './schema.generated';

const client = createProxyClient<RootRouter>({
  url: 'http://localhost:4000/schema-rpc',
});

(async () => {
  try {
    const result1 = await client.test.query({
      url: 'https://example.com',
    });
    console.log('result1: ', result1);
  } catch (err) {
    console.log(err);
  }
})();
