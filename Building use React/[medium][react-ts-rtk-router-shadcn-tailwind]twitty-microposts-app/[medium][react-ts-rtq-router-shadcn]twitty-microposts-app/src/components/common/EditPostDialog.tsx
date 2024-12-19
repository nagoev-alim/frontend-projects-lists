import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Post } from '../../helpers/types';
import { useUpdatePostMutation } from '@features/posts/postsApi';
import { toast } from '../../hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { FaRegEdit } from 'react-icons/fa';
import { Form } from '../ui/form';
import { FormFieldWrapper } from './FormFieldWrapper';


const formSchema = z.object({
  title: z.string()
    .min(2, 'Title must be at least 2 characters long')
    .max(100, 'Title must not exceed 100 characters'),
  body: z.string().min(2, 'Body must be at least 2 characters long'),
});

type EditPostDialogProps = {
  post: Post;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const EditPostDialog = ({ post, isOpen, setIsOpen }: EditPostDialogProps) => {
  const [updatePost] = useUpdatePostMutation();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: post.title,
      body: post.body,
    },
    mode: 'onChange',
  });

  const handleEditSubmit = (values: z.infer<typeof formSchema>) => {
    updatePost({ id: post.id, ...values })
      .unwrap()
      .then(() => {
        toast({ description: 'Post updated successfully' });
        setIsOpen(false);
      })
      .catch((error: Error) => {
        console.error('An error occurred:', error);
        toast({ description: 'Failed to update post' });
      });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => setIsOpen(true)}>
          <FaRegEdit />
          <span>Edit</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit post</DialogTitle>
          <DialogDescription>
            Make changes to your post here.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleEditSubmit)} className="space-y-4">
            <FormFieldWrapper form={form} name="title" label="Title" />
            <FormFieldWrapper form={form} name="body" label="Body" type="textarea" />
            <DialogFooter>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

EditPostDialog.displayName = 'EditPostDialog';
