import { createProxyClient } from '@schema-rpc/client';
import { BaseRouter } from './server';
import { HTTPError } from '@schema-rpc/server';

const client = createProxyClient<BaseRouter>({
  url: 'http://localhost:4000/schema-rpc',
});

(async () => {
  try {
    const result1 = await client.user.greetings.query({ name: 'John' });

    console.log('result1: ', result1);

    const result2 = await client.user.test.query();

    console.log('result: ', result2);
  } catch (err) {
    //@ts-ignore
    console.log(err);
    if (HTTPError.isHttpError(err)) console.log(err.info);
  }
})();
