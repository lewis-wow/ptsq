import { createProxyClient } from 'client';
import { app } from './schema';

const client = createProxyClient(app);

const main = async () => {
  const resultCurrent = await client.user.current.query();

  const resultGet = await client.user.get.query({ id: '1' });

  const resultCreate = await client.user.create.mutate({ email: 'example@example.com', password: '12345678910' });

  console.log(resultCreate.createdAt);
};

main();
