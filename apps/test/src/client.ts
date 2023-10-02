import { createProxyClient } from '@schema-rpc/client';
import { baseRouter } from './schema';

const client = createProxyClient(baseRouter);

const main = async () => {
  const resultCurrent = await client.user.current.query();

  const resultGet = await client.user.get.query({ id: '1' });

  const resultCreate = await client.user.create.mutate({ email: 'example@example.com', password: '12345678910' });

  const mushroom = await client.user.mushroom.get.query({ id: '' });

  console.log(resultCurrent, resultGet, resultCreate, mushroom);
};

main();
