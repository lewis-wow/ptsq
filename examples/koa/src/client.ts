import { createProxyClient } from '@ptsq/client';
import type { BaseRouter } from './server';

const client = createProxyClient<BaseRouter>({
  url: 'http://localhost:4000/ptsq',
});

client.greetings.get
  .query({
    firstName: 'John',
    lastName: 'Doe',
  })
  .then((response) => {
    console.log('Response: ', response);
  });
