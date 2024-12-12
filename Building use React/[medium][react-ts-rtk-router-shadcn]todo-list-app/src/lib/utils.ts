import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function hexToRgba(hex: string, alpha: number = 1): string {
  // Убираем # если он есть
  hex = hex.replace('#', '');

  // Парсим значения RGB
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Проверяем, что значения RGB валидны
  if (isNaN(r) || isNaN(g) || isNaN(b)) {
    throw new Error('Invalid hex color');
  }

  // Возвращаем строку RGBA
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
