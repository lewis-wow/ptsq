import { api } from '@/api';
import { Post } from '@prisma/client';
import { useQueryClient } from '@ptsq/react-client';
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

export type DeletePostProps = {
  post: Pick<Post, 'id'>;
};

export const DeletePost = ({ post }: DeletePostProps) => {
  const queryClient = useQueryClient();

  const deletePostMutation = api.post.delete.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['post'],
      });
    },
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" variant="destructive">
          Delete
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete post</DialogTitle>
        </DialogHeader>

        <DialogFooter>
          <DialogClose asChild>
            <Button
              type="button"
              variant="destructive"
              onClick={() => deletePostMutation.mutate(post)}
            >
              Delete
            </Button>
          </DialogClose>

          <DialogClose asChild>
            <Button type="button">Cancel</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
