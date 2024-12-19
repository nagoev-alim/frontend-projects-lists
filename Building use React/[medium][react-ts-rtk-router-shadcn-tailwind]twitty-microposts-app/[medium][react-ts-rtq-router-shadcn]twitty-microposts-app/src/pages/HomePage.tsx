import { useState } from 'react';
import { Card } from '@/components/ui/card.tsx';
import { useGetPostsQuery } from '@features/posts/postsApi';
import { Spinner } from '@components/ui';
import { CreatePostForm, PostsList } from '@components/common';

const HomePage = () => {
  const { data: posts, isError, isLoading, isSuccess } = useGetPostsQuery();
  const [filter, setFilter] = useState<string>('');

  return (
    <Card className="p-4">
      <div className="grid gap-3">
        <CreatePostForm />

        {isLoading && <Spinner />}

        {isError && (<div className="text-center text-red-500 font-semibold">Error while fetching posts</div>)}

        {isSuccess && (
          <PostsList posts={posts} filter={filter} setFilter={setFilter} />
        )}
      </div>
    </Card>
  );
};

HomePage.displayName = 'HomePage';

export default HomePage;
