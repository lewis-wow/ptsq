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
import { credentialsSignUpSchema } from '@/validation';
import { typeboxResolver } from '@hookform/resolvers/typebox';
import { Static } from '@sinclair/typebox';
import { GetServerSideProps } from 'next';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
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

const SignUp = () => {
  const form = useForm<Static<typeof credentialsSignUpSchema>>({
    resolver: typeboxResolver(credentialsSignUpSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  return (
    <Page>
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Sign up</CardTitle>
          <CardDescription>
            Enter your email below to register new account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-y-4">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit((values) => {
                  signIn('credentials-signup', values);
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
                  Sign up
                </Button>
              </form>
            </Form>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => signIn('github', { callbackUrl: '/' })}
            >
              Sign up by GitHub
            </Button>
          </div>

          <div className="mt-4 text-center text-sm">
            Already have an account?{' '}
            <Link href="/signin" className="underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </Page>
  );
};

export default SignUp;
