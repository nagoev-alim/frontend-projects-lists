import { z } from 'zod';

const validateSchema = z.object({
  title: z.string().min(2, {
    message: 'Todo title must be at least 2 characters.',
  }),
  description: z.string().min(2, {
    message: 'Todo description must be at least 2 characters.',
  }),
  category: z.string(),
  color: z.string(),
  date: z.date(),
});

export default validateSchema;
