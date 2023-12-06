import { createProxyClient } from '@ptsq/client';
import { BaseRouter } from './server/routes/root';

// import { BaseRouter } from '../schema.generated';

const client = createProxyClient<BaseRouter>({
  url: 'http://localhost:4000/ptsq',
});

(async () => {
  const createResponse = await client.user.create.mutate({
    email: 'john.doe@email.com',
    name: 'Johnatan',
  });

  await client.user.create.mutate({
    email: 'miquel@email.com',
    name: 'Miquel',
  });

  console.log('Create response: ', createResponse);

  const updateResponse = await client.user.update.mutate({
    id: createResponse.id,
    name: 'Johnatan',
  });

  console.log('Update response: ', updateResponse);

  const getResponse = await client.user.get.query({
    id: createResponse.id,
  });

  console.log('Get response: ', getResponse);

  const listResponseWihtoutFilters = await client.user.list.query(undefined);

  console.log('List response without filters: ', listResponseWihtoutFilters);

  const listResponseWihtFilters = await client.user.list.query({
    name: 'Johnatan',
  });

  console.log('List response with filters: ', listResponseWihtFilters);

  const deleteResponse = await client.user.delete.mutate({
    id: createResponse.id,
  });

  console.log('Delete response: ', deleteResponse);
})();
