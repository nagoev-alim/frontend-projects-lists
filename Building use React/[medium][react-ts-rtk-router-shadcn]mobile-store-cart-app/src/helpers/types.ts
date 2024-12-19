import { store } from '../app/store';

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;

export type Mobile = {
  id: string,
  title: string,
  price: string,
  img: string,
  amount: number,
}
