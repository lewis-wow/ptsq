import { Page } from '@/components/Page';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { credentialsSignInSchema } from '@/validation';
import { typeboxResolver } from '@hookform/resolvers/typebox';
import { Static } from '@sinclair/typebox';
import { GetServerSideProps } from 'next';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
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

const SignIn = () => {
  const router = useRouter();

  const form = useForm<Static<typeof credentialsSignInSchema>>({
    resolver: typeboxResolver(credentialsSignInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  return (
    <Page>
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Sign in</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-y-4">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(async (values) => {
                  const response = await signIn('credentials-signin', {
                    ...values,
                    redirect: false,
                  });

                  if (!response?.ok) {
                    form.setError('email', { message: 'Invalid credentials' });
                    form.setError('password', {
                      message: 'Invalid credentials',
                    });

                    return;
                  }

                  router.push('/');
                })}
                className="space-y-8"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" variant="outline" className="w-full">
                  Sign in
                </Button>
              </form>
            </Form>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => signIn('github', { callbackUrl: '/' })}
            >
              Sign in by GitHub
            </Button>
          </div>

          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </Page>
  );
};

export default SignIn;
