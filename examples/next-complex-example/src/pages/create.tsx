'use client';

import { api } from '@/api';
import { Page } from '@/components/Page';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { createPostSchema } from '@/validation';
import { typeboxResolver } from '@hookform/resolvers/typebox';
import { Static } from '@ptsq/server';
import { useQueryClient } from '@tanstack/react-query';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
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

const UpdatePost = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const createPostMutation = api.post.create.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['post'],
      });

      router.push('/');
    },
  });

  const form = useForm<Static<typeof createPostSchema>>({
    resolver: typeboxResolver(createPostSchema),
    defaultValues: {
      title: '',
      published: false,
    },
  });

  return (
    <Page>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((values) => {
            createPostMutation.mutate(values);
          })}
          className="space-y-8"
        >
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Title" {...field} />
                </FormControl>
                <FormDescription>This is the post title.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Create post</Button>
        </form>
      </Form>
    </Page>
  );
};

export default UpdatePost;
