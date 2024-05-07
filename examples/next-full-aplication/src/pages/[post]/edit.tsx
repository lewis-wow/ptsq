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
import { updatePostSchema } from '@/validation';
import { typeboxResolver } from '@hookform/resolvers/typebox';
import { Static } from '@ptsq/server';
import { useQueryClient } from '@tanstack/react-query';
import { GetServerSideProps } from 'next';
import Link from 'next/link';
import { NextRouter, useRouter } from 'next/router';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { getServerSideSession } from '../api/auth/[...nextauth]';

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

const EditPost = () => {
  const router: NextRouter & { query: { post?: string } } = useRouter();
  const queryClient = useQueryClient();

  const postQuery = api.post.get.useQuery({
    id: router.query.post!,
  });

  const updatePostMutation = api.post.update.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['post'],
      });
    },
  });

  const form = useForm<Static<typeof updatePostSchema>>({
    resolver: typeboxResolver(updatePostSchema),
    defaultValues: {
      id: postQuery.data?.id,
      title: postQuery.data?.title,
      published: false,
    },
  });

  useEffect(() => {
    form.reset({
      id: postQuery.data?.id,
      title: postQuery.data?.title,
      published: false,
    });
  }, [form, postQuery.data]);

  return (
    <Page
      isLoading={postQuery.isLoading}
      isError={!!postQuery.error}
      header={
        <Button asChild>
          <Link href="/create">Posts</Link>
        </Button>
      }
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((values) => {
            updatePostMutation.mutate(values);
          })}
          className="space-y-8"
        >
          <FormField
            control={form.control}
            name="title"
            defaultValue={postQuery.data?.title}
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
          <Button type="submit">Submit</Button>
        </form>
      </Form>
    </Page>
  );
};

export default EditPost;
