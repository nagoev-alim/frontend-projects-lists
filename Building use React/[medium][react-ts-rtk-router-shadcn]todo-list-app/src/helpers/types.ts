import { z } from 'zod';
import { validateSchema } from '@helpers/index.ts';
import { store } from '@app/store.ts';

export type FormSchemaType = z.infer<typeof validateSchema>;

export type Todo = {
  id?: string;
  title: string;
  description: string;
  category: string;
  date: Date;
  color: string;
  completed: boolean;
}

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
