import { createProxyClient } from '@schema-rpc/client';
import { RootRouter } from './schema.generated';

const client = createProxyClient<RootRouter>();

(async () => {
  const result = await client.test.mutate();

  console.log('result: ', result);
})();
