import { createProxyClient } from '@ptsq/client';
import { BaseRouter } from './server';

const client = createProxyClient<BaseRouter>({
  url: 'http://localhost:4000/ptsq',
});

client.urlPortQuery
  .query({
    url: 'http://localhost:3000',
  })
  .then((response) => {
    console.log(response);
  });
