import { createProxyClient } from '@ptsq/client';
import { inferPtsqSchema } from '@ptsq/server/dist/types';
import { schema } from './schema.generated';
import type { BaseRouter } from './server';

const client = createProxyClient<BaseRouter>({
  url: 'http://localhost:4000/ptsq',
});

const ac = new AbortController();

client.greetings
  .query(
    {
      firstName: '',
      lastName: '',
    },
    {
      signal: ac.signal,
    },
  )
  .then((response) => {
    console.log('Greetings response: ', response);
  });

setTimeout(() => ac.abort(), 1000);
