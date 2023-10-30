import { createProxyClient } from '@ptsq/client';
import { BaseRouter } from './server';

const client = createProxyClient<BaseRouter>({
  url: 'http://localhost:4000/ptsq',
});

client.greetings
  .query({
    name: 'John',
  })
  .then((result) => {
    console.log(`Hover over the result variable to see it is a string.`);
    console.log('result =', result);
  })
  .catch((error) => {
    console.error(error);
  });
