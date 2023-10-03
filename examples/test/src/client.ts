import { createProxyClient } from '@schema-rpc/client';
import { baseRouter } from './schema';

const client = createProxyClient(baseRouter);

const main = async () => {
  const result = await client.test.query();

  console.log(result);
};

main();
