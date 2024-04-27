import { api } from '@/api';
import { createPostSchema } from '@/validation';
import { typeboxResolver } from '@hookform/resolvers/typebox';
import { useQueryClient } from '@ptsq/react-client';
import { Static } from '@ptsq/server';
import { Controller, useForm } from 'react-hook-form';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';

export const CreatePost = () => {
  const queryClient = useQueryClient();

  const createPostMutation = api.post.create.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['post'],
      });
    },
  });

  const {
    handleSubmit: handleSubmitCreatePost,
    control: controlCreatePost,
    reset: resetCreatePostForm,
  } = useForm<Static<typeof createPostSchema>>({
    resolver: typeboxResolver(createPostSchema),
    defaultValues: {
      published: false,
    },
  });

  return (
    <main className="flex flex-col">
      <form
        onSubmit={handleSubmitCreatePost((data) => {
          createPostMutation.mutate(data);
          resetCreatePostForm();
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

          <Button type="submit">Create post</Button>
        </div>
      </form>
    </main>
  );
};
