import { api } from '@/api';
import { TextField } from '@/components/TextField';
import { createPostSchema } from '@/validation';
import { typeboxResolver } from '@hookform/resolvers/typebox';
import { Static } from '@ptsq/server';
import { useQueryClient } from '@tanstack/react-query';
import { Button, Card, Table } from 'flowbite-react';
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
              render={({ field }) => <TextField {...field} label="Title" />}
            />

            <Controller
              control={control}
              name="content"
              defaultValue={''}
              render={({ field }) => <TextField {...field} label="Content" />}
            />

            <Button type="submit">Submit</Button>
          </form>
        </Card>
      </section>

      <Table>
        <Table.Head>
          <Table.HeadCell>Title</Table.HeadCell>
          <Table.HeadCell>Content</Table.HeadCell>
          <Table.HeadCell>Action</Table.HeadCell>
        </Table.Head>
        <Table.Body>
          {listPostsQuery.data?.map((post) => (
            <Table.Row key={post.id}>
              <Table.Cell>{post.title}</Table.Cell>
              <Table.Cell>{post.content}</Table.Cell>
              <Table.Cell>
                <Button
                  onClick={() =>
                    deletePostMutation.mutate({
                      id: post.id,
                    })
                  }
                >
                  Delete
                </Button>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </main>
  );
}
