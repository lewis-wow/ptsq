import { createProxyClient } from '@schema-rpc/client';
import { baseRouter } from './schema/dist/src';
import { writeFileSync } from 'fs';

const client = createProxyClient(baseRouter);

writeFileSync('ff', 'ff');

const main = async () => {
  const result = await client.test.query();

  console.log(result);
};

main();
