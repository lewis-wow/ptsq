import { createProxyClient } from '@ptsq/client';
import { IntrospectedRouter } from '@ptsq/server';
import { schema } from './schema.generated';
import type { BaseRouter } from './server';

const client = createProxyClient<typeof schema>({
  url: 'http://localhost:4000/ptsq',
});

client.greetings.query().then((response) => {
  console.log('Greetings response: ', response);
});
