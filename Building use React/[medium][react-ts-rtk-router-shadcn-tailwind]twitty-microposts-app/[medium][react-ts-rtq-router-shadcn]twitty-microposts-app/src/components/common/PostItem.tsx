import { useState } from 'react';
import { EditPostDialog } from './EditPostDialog';
import { DeletePostDialog } from './DeletePostDialog';
import { Post } from '../../helpers/types';
import { Card } from '../ui/card';

type PostItemProps = {
  post: Post;
}

export const PostItem = ({ post }: PostItemProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  return (
    <li>
      <Card className="grid gap-2 p-4 rounded border">
        <h3 className="font-bold text-xl">{post.title}</h3>
        <p>{post.body}</p>
        <div className="flex flex-wrap ml-auto gap-2">
          <EditPostDialog
            post={post}
            isOpen={isDialogOpen}
            setIsOpen={setIsDialogOpen}
          />
          <DeletePostDialog postId={post.id} />
        </div>
      </Card>
    </li>
  );
};

PostItem.displayName = 'PostItem';
