import { createProxyClient } from '@ptsq/client';
import { Gender } from './gender';
import { BaseRouter } from './server';

//import { BaseRouter } from './schema.generated';

const client = createProxyClient<BaseRouter>({
  url: 'http://localhost:4000/ptsq',
});

client.greetings
  .query({
    person: {
      id: '266b6a56-87c2-11ee-b9d1-0242ac120002',
      firstName: 'John',
      lastName: 'Doe',
      contact: {
        url: 'http://localhost:3000/johndoe',
      },
      gender: Gender.MALE,
      bornAt: new Date().toISOString(),
    },
  })
  .then((response) => {
    console.log(response);
  })
  .catch((error) => {
    console.error(Object.keys(error));
    console.error(error.response.data.info);
  });
