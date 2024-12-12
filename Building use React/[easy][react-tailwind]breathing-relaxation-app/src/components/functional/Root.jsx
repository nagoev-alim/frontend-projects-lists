import React, { useState, useEffect, useRef } from 'react';

/**
 * Объект с константами для управления временем дыхательного цикла.
 * @property {number} total - Общая продолжительность цикла в миллисекундах.
 * @property {number} breathe - Продолжительность вдоха (2/5 от общего времени).
 * @property {number} hold - Продолжительность задержки дыхания (1/5 от общего времени).
 */
const Constants = {
  total: 7500,
  get breathe() {
    return (this.total / 5) * 2;
  },
  get hold() {
    return this.total / 5;
  },
};

/**
 * Компонент Root - основной компонент приложения для релаксации.
 * @returns {JSX.Element} Возвращает JSX разметку компонента.
 */
const Root = () => {
  // Состояние для текста инструкции
  const [text, setText] = useState('');
  // Состояние для класса контейнера
  const [containerClass, setContainerClass] = useState('relaxer-app__container');
  // Ref для хранения идентификатора интервала
  const intervalRef = useRef(null);

  /**
   * Функция для запуска анимации дыхательного цикла.
   * Управляет текстом инструкции и классом контейнера для визуализации фаз дыхания.
   */
  const startBreathingAnimation = () => {
    setText('Breathe In! 😤');
    setContainerClass('relaxer-app__container grow');

    setTimeout(() => {
      setText('Hold 🤐');

      setTimeout(() => {
        setText('Breathe Out! 😮‍💨');
        setContainerClass('relaxer-app__container shrink');
      }, Constants.hold);
    }, Constants.breathe);
  };

  /**
   * Эффект для инициализации и очистки интервала дыхательного цикла.
   * Запускается при монтировании компонента и очищается при размонтировании.
   */
  useEffect(() => {
    startBreathingAnimation();
    intervalRef.current = setInterval(startBreathingAnimation, Constants.total);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <div className="grid bg-white border-2 rounded-md shadow max-w-md w-full place-items-center gap-4 p-5 pb-14">
      <div className="relaxer-app">
        <h2 className="text-center text-2xl font-bold">Relaxer App 🧘</h2>
        <div className={containerClass}>
          <div className="relaxer-app__circle"/>
          <p>{text}</p>
          <div className="relaxer-app__pointer">
            <span className="pointer" />
          </div>
          <div className="relaxer-app__gradient-circle"/>
        </div>
      </div>
    </div>
  );
};

export default Root;
