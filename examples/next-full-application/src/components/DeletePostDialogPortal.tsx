import { api } from '@/api';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Post } from '@prisma/client';
import { useQueryClient } from '@tanstack/react-query';
import { ReactElement } from 'react';
import { Button } from './ui/button';

export type DeletePostDialogPortalProps = {
  post: Pick<Post, 'id'>;
  children: ReactElement;
};

export const DeletePostDialogPortal = ({
  post,
  children,
}: DeletePostDialogPortalProps) => {
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
      <DialogTrigger asChild>{children}</DialogTrigger>
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
