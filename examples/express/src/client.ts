import { createProxyClient } from '@ptsq/client';
import { BaseRouter } from './server';
//import { RootRouter } from './schema.generated';

const client = createProxyClient<BaseRouter>({
  url: 'http://localhost:4000/ptsq',
});

(async () => {
  try {
    const result1 = await client.test.query({
      name: 'https://example.com',
    });
    console.log('result1: ', result1);
  } catch (err) {
    console.log(err);
  }
})();
