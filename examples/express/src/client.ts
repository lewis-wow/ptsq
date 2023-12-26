import { createProxyClient } from '@ptsq/client';
import { BaseRouter } from './server';

// import { BaseRouter } from './schema.generated';

const client = createProxyClient<BaseRouter>({
  url: 'http://localhost:4000/ptsq',
});

client.greetings
  .query(new Date().toISOString())
  .then((response) => {
    console.log(response);
  })
  .catch((error) => console.log(error.response.data));
