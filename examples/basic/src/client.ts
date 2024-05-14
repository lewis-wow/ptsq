import { createProxyClient } from '@ptsq/client';
import type { BaseRouter } from './server';

// import { BaseRouter } from './generated/schema.generated';

const client = createProxyClient<BaseRouter>({
  url: 'http://localhost:4000/ptsq',
});

client.greetings
  .query({
    firstName: 'John',
    lastName: 'Doe',
  })
  .then((response) => {
    console.log('Response: ', response);
  });
