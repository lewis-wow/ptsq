import { client } from '@/client';
import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    client.user.create
      .mutate({
        name: 'Johnatan',
        email: 'kokoss@boss.com',
      })
      .then(console.log);
  }, []);

  return <main></main>;
}
