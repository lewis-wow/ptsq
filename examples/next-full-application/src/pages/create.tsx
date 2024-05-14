'use client';

import { api } from '@/api';
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
import { createPostSchema } from '@/validation';
import { typeboxResolver } from '@hookform/resolvers/typebox';
import { PostStatus } from '@prisma/client';
import { Static } from '@sinclair/typebox';
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
  });

  return (
    <Page
      pageLinks={[
        { title: 'Posts', href: '/', active: false },
        { title: 'Create post', href: '/create', active: true },
      ]}
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((values) => {
            createPostMutation.mutate(values);
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
                      <FormItem defaultValue={PostStatus.DRAFT}>
                        <FormLabel>Status</FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={PostStatus.DRAFT}>
                                Draft
                              </SelectItem>
                              <SelectItem value={PostStatus.PUBLISHED}>
                                Published
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Button type="submit">Create post</Button>
        </form>
      </Form>
    </Page>
  );
};

export default UpdatePost;
