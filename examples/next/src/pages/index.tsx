import { api } from '@/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { createPostSchema } from '@/validation';
import { typeboxResolver } from '@hookform/resolvers/typebox';
import { Static } from '@ptsq/server';
import { useQueryClient } from '@tanstack/react-query';
import { Controller, useForm } from 'react-hook-form';

export default function Home() {
  const queryClient = useQueryClient();

  const { handleSubmit, control } = useForm<Static<typeof createPostSchema>>({
    resolver: typeboxResolver(createPostSchema),
    defaultValues: {
      published: false,
    },
  });

  const listPostsQuery = api.post.list.useQuery();

  const createPostMutation = api.post.create.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['post'],
      });
    },
  });

  const deletePostMutation = api.post.delete.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['post'],
      });
    },
  });

  return (
    <main>
      <section className="max-w-xl">
        <Card>
          <form
            onSubmit={handleSubmit((data) => {
              console.log(data);
              createPostMutation.mutate(data);
            })}
          >
            <Controller
              control={control}
              name="title"
              defaultValue={''}
              render={({ field }) => (
                <Input type="text" {...field} placeholder="Title" />
              )}
            />

            <Controller
              control={control}
              name="content"
              defaultValue={''}
              render={({ field }) => (
                <Input type="text" {...field} placeholder="Content" />
              )}
            />

            <Button type="submit">Submit</Button>
          </form>
        </Card>
      </section>

      <Table>
        <TableHeader>
          <TableHead>Title</TableHead>
          <TableHead>Content</TableHead>
          <TableHead>Action</TableHead>
        </TableHeader>
        <TableBody>
          {listPostsQuery.data?.map((post) => (
            <TableRow key={post.id}>
              <TableCell>{post.title}</TableCell>
              <TableCell>{post.content}</TableCell>
              <TableCell>
                <Button
                  onClick={() =>
                    deletePostMutation.mutate({
                      id: post.id,
                    })
                  }
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </main>
  );
}
