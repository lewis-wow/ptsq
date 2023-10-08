import { createProxyClient } from '@schema-rpc/client';
import { BaseRouter } from './server';

const client = createProxyClient<BaseRouter>();

(async () => {
  const result = await client.test.mutate();

  console.log('result: ', result);
})();
