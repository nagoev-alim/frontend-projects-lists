import { useDeletePostMutation } from '@features/posts/postsApi';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../ui/alert-dialog';
import { toast } from '../../hooks/use-toast';
import { Button } from '../ui/button';
import { IoMdClose } from 'react-icons/io';

type DeletePostDialogProps = {
  postId: string;
}

export const DeletePostDialog = ({ postId }: DeletePostDialogProps) => {
  const [deletePost] = useDeletePostMutation();

  const handleDeletePost = async () => {
    try {
      await deletePost(postId).unwrap();
      toast({ description: 'Post deleted successfully' });
    } catch (error) {
      console.error('An error occurred:', error);
      toast({ description: 'Failed to delete post' });
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">
          <IoMdClose />
          <span>Delete</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your post.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDeletePost}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
DeletePostDialog.displayName = 'DeletePostDialog';
