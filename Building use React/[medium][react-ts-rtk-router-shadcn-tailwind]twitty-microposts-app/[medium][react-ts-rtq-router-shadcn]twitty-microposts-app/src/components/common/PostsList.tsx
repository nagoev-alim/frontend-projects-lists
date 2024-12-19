import { useMemo } from 'react';
import { PostItem } from './PostItem';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Post } from '../../helpers/types';

type PostsListProps = {
  posts: Post[];
  filter: string;
  setFilter: (filter: string) => void;
}

export const PostsList = ({ posts, filter, setFilter }: PostsListProps) => {
  const filteredPosts = useMemo(() => {
    return posts?.filter(post =>
      post.title.toLowerCase().includes(filter.toLowerCase()) ||
      post.body.toLowerCase().includes(filter.toLowerCase()),
    );
  }, [posts, filter]);

  return (
    <div className="grid gap-4">
      <Label className="grid gap-2">
        <span>Filter Posts:</span>
        <Input
          value={filter}
          placeholder="Filter posts by title and body"
          onChange={(e) => setFilter(e.target.value)}
        />
      </Label>
      <div className="grid gap-2">
        {filteredPosts && filteredPosts.length > 0 && <h3 className="font-bold text-lg">Latest Posts:</h3>}
        <ul className="grid gap-3">
          {filteredPosts?.map((post: Post) => (
            <PostItem key={post.id} post={post} />
          ))}
        </ul>
      </div>
    </div>
  );
};

PostsList.displayName = 'PostsList';
