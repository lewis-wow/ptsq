import { client } from './client';

export const App = () => {
  const greetingsQuery = client.greetingsQuery.useQuery({ name: 'John' });
  const greetingsMutation = client.greetingsMutation.useMutation();

  return (
    <main>
      <p>
        state: <pre>{JSON.stringify(greetingsQuery)}</pre>
      </p>
      <p>result: {greetingsQuery.data}</p>

      <button onClick={() => greetingsMutation.mutate({ name: 'John' })}>
        Mutate
      </button>

      <p>
        state: <pre>{JSON.stringify(greetingsMutation)}</pre>
      </p>
      <p>result: {greetingsMutation.data}</p>
    </main>
  );
};
