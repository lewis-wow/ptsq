import { api } from '@/api';
import { Page } from '@/components/Page';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GetServerSideProps } from 'next';
import { signOut } from 'next-auth/react';
import { getServerSideSession } from './api/auth/[...nextauth]';

export const getServerSideProps = (async ({ req, res }) => {
  const session = await getServerSideSession({ req, res });

  if (!session) {
    return {
      redirect: {
        destination: '/signin',
        permanent: false,
      },
      props: {},
    };
  }

  return {
    props: {},
  };
}) satisfies GetServerSideProps<{}>;

export default function Home() {
  const meQuery = api.me.get.useQuery();

  return (
    <Page isLoading={meQuery.isFetching} isError={!!meQuery.error}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <p>User email: {meQuery.data?.email}</p>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => signOut()}
          >
            Sign out
          </Button>
        </CardContent>
      </Card>
    </Page>
  );
}
