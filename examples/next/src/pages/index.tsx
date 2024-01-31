import { ptsq } from '@/ptsq';

export default function Home() {
  const greetingsQuery = ptsq.greetings.useQuery(
    { name: 'John' },
    { enabled: false },
  );

  return (
    <main>
      <button onClick={() => greetingsQuery.refetch()}>Refetch</button>
      <div>
        state: <pre>{JSON.stringify(greetingsQuery)}</pre>
      </div>
      <div>result: {greetingsQuery.data}</div>
    </main>
  );
}
