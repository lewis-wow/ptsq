import { createProxyClient } from '@schema-rpc/client';
import { BaseRouter } from './server';

const client = createProxyClient<BaseRouter>({
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
