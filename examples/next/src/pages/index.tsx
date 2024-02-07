import { api } from '@/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { createPostSchema, updatePostSchema } from '@/validation';
import { typeboxResolver } from '@hookform/resolvers/typebox';
import { Static } from '@ptsq/server';
import { useQueryClient } from '@tanstack/react-query';
import { Controller, useForm } from 'react-hook-form';

export default function Home() {
  const queryClient = useQueryClient();

  const { handleSubmit: handleSubmitCreatePost, control: controlCreatePost } =
    useForm<Static<typeof createPostSchema>>({
      resolver: typeboxResolver(createPostSchema),
      defaultValues: {
        published: false,
      },
    });

  const {
    handleSubmit: handleSubmitUpdatePost,
    control: controlUpdatePost,
    formState: { errors: errorsUpdatePost },
  } = useForm<Static<typeof updatePostSchema>>({
    resolver: typeboxResolver(updatePostSchema),
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

  const updatePostMutation = api.post.update.useMutation({
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
    <main className="container">
      <Card>
        <div className="p-2">
          <form
            onSubmit={handleSubmitCreatePost((data) => {
              createPostMutation.mutate(data);
            })}
          >
            <div className="flex flex-col gap-y-2">
              <Controller
                control={controlCreatePost}
                name="title"
                defaultValue={''}
                render={({ field }) => (
                  <Input type="text" {...field} placeholder="Title" />
                )}
              />

              <Controller
                control={controlCreatePost}
                name="content"
                defaultValue={''}
                render={({ field }) => (
                  <Textarea
                    placeholder="Content"
                    className="resize-none"
                    {...field}
                  />
                )}
              />

              <Button type="submit">Submit</Button>
            </div>
          </form>

          {listPostsQuery.data && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Content</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {listPostsQuery.data.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell>{post.title}</TableCell>
                    <TableCell>{post.content}</TableCell>
                    <TableCell>
                      <div className="flex gap-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button type="button">Edit</Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                              <DialogTitle>Edit post</DialogTitle>
                            </DialogHeader>
                            <form
                              onSubmit={handleSubmitUpdatePost((data) => {
                                console.log(data);
                                updatePostMutation.mutate(data);
                              })}
                            >
                              <div className="flex flex-col gap-y-2">
                                <Controller
                                  control={controlUpdatePost}
                                  name="id"
                                  defaultValue={post.id}
                                  render={({ field }) => (
                                    <Input type="hidden" {...field} />
                                  )}
                                />

                                <Controller
                                  control={controlUpdatePost}
                                  name="title"
                                  defaultValue={post.title}
                                  render={({ field }) => (
                                    <Input
                                      type="text"
                                      {...field}
                                      placeholder="Title"
                                    />
                                  )}
                                />

                                <Controller
                                  control={controlUpdatePost}
                                  name="content"
                                  defaultValue={post.content ?? ''}
                                  render={({ field }) => (
                                    <Textarea
                                      placeholder="Content"
                                      className="resize-none"
                                      {...field}
                                    />
                                  )}
                                />

                                <Button type="submit">Save changes</Button>
                              </div>
                            </form>
                          </DialogContent>
                        </Dialog>

                        <Button
                          variant="destructive"
                          onClick={() =>
                            deletePostMutation.mutate({
                              id: post.id,
                            })
                          }
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </Card>
    </main>
  );
}
