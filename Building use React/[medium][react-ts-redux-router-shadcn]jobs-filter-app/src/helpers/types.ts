import { store } from '../app/store';

export type Job = {
  id: number;  // Изменено с string на number
  company: string;
  logo: string;
  new: boolean;
  featured: boolean;
  position: string;
  role: string;
  level: string;
  postedAt: string;
  contract: string;
  location: string;
  languages: string[];
  tools: string[];
}

export type Jobs = Job[];  // Определяем Jobs как массив Job

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
