import { client } from '@/client';
import { useMutation } from '@tanstack/react-query';
import { useEffect } from 'react';

export default function Index() {
  const createUserMutation = useMutation({
    mutationKey: [''],
    mutationFn: (params) => client.user.create(params),
  });

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
