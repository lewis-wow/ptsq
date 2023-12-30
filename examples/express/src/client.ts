import { createProxyClient } from '@ptsq/client';
import { BaseRouter } from './server';

// import { BaseRouter } from './schema.generated';

const client = createProxyClient<BaseRouter>({
  url: 'http://localhost:4000/ptsq',
});

client.greetings
  .query({
    firstName: 'asdfa',
    lastName: 'asdfasdf',
    age: 11,
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    url: 'http://localhost:3000/pathname',
  })
  .then((response) => {
    console.log(response);
  })
  .catch((error) => console.log(error));
