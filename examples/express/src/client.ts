import { createProxyClient } from '@schema-rpc/client';
//import { BaseRouter } from './server';
import { RootRouter } from './schema.generated';

const client = createProxyClient<RootRouter>({
  url: 'http://localhost:4000/schema-rpc',
});

(async () => {
  const result = client.inner.test2.query({});

  console.log('result: ', result);
})();
