import { createProxyClient } from '@ptsq/client';
import { URLScalar } from './scalars/URLScalar';
import { BaseRouter } from './server';

//import { BaseRouter } from './schema.generated';

const client = createProxyClient<BaseRouter>({
  url: 'http://localhost:4000/ptsq',
});

client.greetings
  .query({
    url: URLScalar.serialize(new URL('http://localhost:3000/pathname')),
  })
  .then((response) => {
    console.log(URLScalar.parse(response));
  });
