import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GetServerSideProps } from 'next';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
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

export default function SignUp() {
  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Sign up</CardTitle>
      </CardHeader>
      <CardContent>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => signIn('github', { callbackUrl: '/' })}
        >
          Sign up by GitHub
        </Button>

        <div className="mt-4 text-center text-sm">
          Already have an account?{' '}
          <Link href="/signin" className="underline">
            Sign in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
