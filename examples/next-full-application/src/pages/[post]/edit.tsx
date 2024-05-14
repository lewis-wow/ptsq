import { api } from '@/api';
import { DataLoader } from '@/components/DataLoader';
import { Page } from '@/components/Page';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { updatePostSchema } from '@/validation';
import { typeboxResolver } from '@hookform/resolvers/typebox';
import { PostStatus } from '@prisma/client';
import { Static } from '@sinclair/typebox';
import { useQueryClient } from '@tanstack/react-query';
import { GetServerSideProps } from 'next';
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
      content: postQuery.data?.content ?? undefined,
      status: postQuery.data?.status,
    },
    values: {
      id: postQuery.data?.id ?? '',
      title: postQuery.data?.title,
      content: postQuery.data?.content ?? undefined,
      status: postQuery.data?.status,
    },
  });

  return (
    <Page
      pageLinks={[
        { title: 'Posts', href: '/', active: false },
        { title: 'Create post', href: '/create', active: false },
        {
          title: 'Edit post',
          href: `/${router.query.post}/edit`,
          active: true,
        },
      ]}
    >
      <DataLoader isLoading={postQuery.isLoading} isError={!!postQuery.error}>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) => {
              updatePostMutation.mutate(values);
            })}
            className="space-y-8"
          >
            <Card>
              <CardHeader>
                <CardTitle>Post Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  <div className="grid gap-3">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Title" {...field} />
                          </FormControl>
                          <FormDescription>
                            This is the post title.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid gap-3">
                    <FormField
                      control={form.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Content</FormLabel>
                          <FormControl>
                            <Textarea
                              className="min-h-32"
                              placeholder="Content..."
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            This is the post content.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Post Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  <div className="grid gap-3">
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value={PostStatus.DRAFT}>
                                Draft
                              </SelectItem>
                              <SelectItem value={PostStatus.PUBLISHED}>
                                Published
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button type="submit">Update post</Button>
          </form>
        </Form>
      </DataLoader>
    </Page>
  );
};

export default EditPost;
