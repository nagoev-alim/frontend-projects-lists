import { useState, useEffect, useCallback } from 'react';

/**
 * Компонент для отображения статистического элемента с анимированным счетчиком.
 * @param {Object} props - Свойства компонента.
 * @param {number} props.target - Целевое значение счетчика.
 * @param {string} props.label - Текстовая метка для описания статистики.
 * @param {number} props.speed - Скорость обновления счетчика в миллисекундах.
 * @returns {JSX.Element} Элемент списка с анимированным счетчиком и меткой.
 */
const StatItem = ({ target, label, speed }) => {
  // Состояние для хранения текущего значения счетчика
  const [count, setCount] = useState(0);

  /**
   * Функция для инкрементации счетчика.
   * Мемоизирована для оптимизации производительности.
   */
  const incrementCount = useCallback(() => {
    const increment = Math.ceil(target / 100);
    setCount(prevCount => {
      const newCount = prevCount + increment;
      return newCount >= target ? target : newCount;
    });
  }, [target]);

  /**
   * Эффект для управления анимацией счетчика.
   * Создает и очищает интервал для обновления счетчика.
   */
  useEffect(() => {
    // Прекращаем анимацию, если достигнуто целевое значение
    if (count >= target) return;

    // Устанавливаем интервал для обновления счетчика
    const timer = setInterval(incrementCount, speed);

    // Функция очистки для удаления интервала при размонтировании компонента
    return () => clearInterval(timer);
  }, [count, target, speed, incrementCount]);

  // Рендерим элемент списка с счетчиком и меткой
  return (
    <li>
      <span className='text-4xl font-bold sm:text-6xl'>{count}+</span>
      <p className='font-medium'>{label}</p>
    </li>
  );
};

/**
 * Корневой компонент для отображения статистики.
 * @returns {JSX.Element} Контейнер с заголовком и списком статистических элементов.
 */
const Root = () => {
  // Массив с данными для статистических элементов
  const stats = [
    { target: 120, label: 'Succeeded projects', speed: 30 },
    { target: 140, label: 'Working hours spent', speed: 20 },
    { target: 150, label: 'Happy clients', speed: 10 },
  ];

  return (
    <div className='grid w-full max-w-3xl gap-4 rounded border bg-white p-3 shadow'>
      <h1 className='text-center text-2xl font-bold md:text-4xl'>Our stats</h1>
      <ul className='grid gap-3 place-items-center text-center lg:grid-cols-3'>
        {stats.map((stat, index) => (
          <StatItem key={index} target={stat.target} label={stat.label} speed={stat.speed} />
        ))}
      </ul>
    </div>
  );
};

export default Root;
