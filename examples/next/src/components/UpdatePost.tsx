import { api } from '@/api';
import { updatePostSchema } from '@/validation';
import { typeboxResolver } from '@hookform/resolvers/typebox';
import { Post } from '@prisma/client';
import { Static } from '@ptsq/server';
import { useQueryClient } from '@tanstack/react-query';
import { Controller, useForm } from 'react-hook-form';
import { Button } from './ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';

export type UpdatePostProps = {
  post: Post;
};

export const UpdatePost = ({ post }: UpdatePostProps) => {
  const queryClient = useQueryClient();

  const updatePostMutation = api.post.update.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['post'],
      });
    },
  });

  const { handleSubmit: handleSubmitUpdatePost, control: controlUpdatePost } =
    useForm<Static<typeof updatePostSchema>>({
      resolver: typeboxResolver(updatePostSchema),
      defaultValues: {
        ...post,
        content: post.content ?? '',
      },
    });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button">Update</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update post</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmitUpdatePost((data) => {
            updatePostMutation.mutate(data);
          })}
        >
          <div className="flex flex-col gap-y-2">
            <Controller
              control={controlUpdatePost}
              name="title"
              defaultValue={post.title}
              render={({ field }) => (
                <Input type="text" {...field} placeholder="Title" />
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

            <DialogClose asChild>
              <Button type="submit">Update post</Button>
            </DialogClose>
          </div>
        </form>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button">Cancel</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
