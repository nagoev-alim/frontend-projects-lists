import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreatePostMutation } from '@features/posts/postsApi';
import { toast } from '../../hooks/use-toast';
import { Form } from '../ui/form';
import { FormFieldWrapper } from './FormFieldWrapper';
import { Button } from '../ui/button';

const formSchema = z.object({
  title: z.string()
    .min(2, 'Title must be at least 2 characters long')
    .max(100, 'Title must not exceed 100 characters'),
  body: z.string().min(2, 'Body must be at least 2 characters long'),
});

export const CreatePostForm = () => {
  const [createPost] = useCreatePostMutation();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      body: '',
    },
    mode: 'onChange',
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    createPost(values)
      .unwrap()
      .then(() => {
        toast({ description: 'Post created successfully' });
        form.reset();
      })
      .catch((error) => {
        console.error('An error occurred:', error);
        toast({ description: 'Failed to create post' });
      });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormFieldWrapper form={form} name="title" label="Post Title" placeholder="Hello World!"/>
        <FormFieldWrapper form={form} name="body" label="Post Description" type="textarea" placeholder="Place for your description"/>
        <div className="inline-flex gap-2">
          <Button type="submit">Submit</Button>
          <Button variant="destructive" type="reset" onClick={() => form.reset()}>Reset</Button>
        </div>
      </form>
    </Form>
  );
};

CreatePostForm.displayName = 'CreatePostForm';
