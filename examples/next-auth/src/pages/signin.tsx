import { Page } from '@/components/Page';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GetServerSideProps } from 'next';
import { signIn } from 'next-auth/react';
import { getServerSideSession } from './api/auth/[...nextauth]';

export const getServerSideProps = (async ({ req, res }) => {
  const session = await getServerSideSession({ req, res });

  if (session) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
      props: {},
    };
  }

  return {
    props: {},
  };
}) satisfies GetServerSideProps<{}>;

export default function SignIn() {
  return (
    <Page>
      <Button
        variant="outline"
        onClick={() => signIn('github', { callbackUrl: '/' })}
      >
        Sign in by GitHub
      </Button>
    </Page>
  );
}
