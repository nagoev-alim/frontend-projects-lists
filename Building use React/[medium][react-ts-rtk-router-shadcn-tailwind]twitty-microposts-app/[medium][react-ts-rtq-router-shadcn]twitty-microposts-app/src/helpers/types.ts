import { store } from '../app/store';

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type Post = {
  id: string;
  title: string;
  body: string;
}
export type Posts = Post[];
export type PostsState = {
  editingReview: Post | null,
}
