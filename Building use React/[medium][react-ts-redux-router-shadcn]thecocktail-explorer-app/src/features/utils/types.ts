import { AsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { store } from '@app/store';

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;

export type ActionCreator = AsyncThunk<any, any, {}>;

export type ApiMethod<ArgType, ResultType> = (
  arg: ArgType,
  state: RootState,
  thunkAPI: any,
) => Promise<ResultType>;

export type FeaturesProps = {
  POSTS_SLICE: {
    name: string;
    initialState: {
      isLoading: boolean;
      isSuccess: boolean;
      isError: boolean | null;
      data: {
        posts: Post[] | null;
        post: Post | null;
        postsWithUser: PostWithUser | null;
      };
    };
    actionTypes: {
      GET_POSTS: string,
      GET_POST_BY_ID: string,
      GET_POST_WITH_USER: string,
    };
  },
  USERS_SLICE: {
    name: string;
    initialState: {
      isLoading: boolean;
      isSuccess: boolean;
      isError: boolean | null;
      data: {
        users: User[] | null;
        user: User | null;
      };
    };
    actionTypes: {
      GET_USERS: string,
      GET_USER_BY_ID: string,
    };
  },
  SLICE_CASE_TYPE: {
    PENDING: (state: SliceState) => void,
    FULFILLED: (state: SliceState, action: PayloadAction<any>, updateData: (data: any, payload: any) => void) => void,
    REJECTED: (state: SliceState, action: PayloadAction<any>) => void,
  }
}

export type SliceState = {
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean | null;
  data: Record<string, any>
}

export type Post = {
  userId: number;
  id: number;
  title: string;
  body: string;
}

export type User = {
  id: number;
  name: string;
  username: string;
  email: string;
  address: {
    street: string;
    suite: string;
    city: string;
    zipcode: string;
    geo: {
      lat: string;
      lng: string;
    }
  };
  phone: string;
  website: string;
  company: {
    name: string;
    catchPhrase: string;
    bs: string;
  }
}

export type PostWithUser = {
  post: Post;
  user: User;
}

export type UserSliceData = {
  users: User[] | null;
  user: User | null;
}

export type PostSliceData = {
  posts: Post[] | null;
  post: Post | null;
  postsWithUser: PostWithUser | null;
}
