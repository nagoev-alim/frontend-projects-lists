import * as z from 'zod';

const authSchema = z.object({
  email: z.string().email('Неверный формат email'),
  password: z.string()
    .min(6, 'Пароль должен содержать минимум 6 символов')
    .regex(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{6,}$/,
      'Пароль должен содержать минимум 1 заглавную букву, 1 цифру и 1 специальный символ'),
});

export default authSchema;
