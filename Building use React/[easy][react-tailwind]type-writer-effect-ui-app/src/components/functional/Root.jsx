import { useState, useEffect } from 'react';

/**
 * Компонент Root, реализующий эффект печатающейся машинки.
 * @param {RootProps} props - Свойства компонента.
 * @property {number} [typingSpeed=100] - Скорость печати текста в миллисекундах.
 * @property {number} [eraseSpeed=50] - Скорость удаления текста в миллисекундах.
 * @property {number} [delayBetweenTexts=2000] - Задержка между текстами в миллисекундах.
 * @returns {JSX.Element} JSX элемент с эффектом печатающейся машинки.
 */
const Root = ({ typingSpeed = 100, eraseSpeed = 50, delayBetweenTexts = 2000 }) => {
  // Массив текстов для отображения
  const texts = ['Developer', 'Designer', 'Creator'];

  // Состояния для управления текущим текстом, индексом и режимом печати
  const [currentText, setCurrentText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    const targetText = texts[currentIndex];

    if (isTyping) {
      if (currentText.length < targetText.length) {
        // Добавление следующего символа
        const timeoutId = setTimeout(() => {
          setCurrentText(targetText.slice(0, currentText.length + 1));
        }, typingSpeed);
        return () => clearTimeout(timeoutId);
      } else {
        // Задержка перед началом удаления
        const timeoutId = setTimeout(() => {
          setIsTyping(false);
        }, delayBetweenTexts);
        return () => clearTimeout(timeoutId);
      }
    } else {
      if (currentText.length > 0) {
        // Удаление последнего символа
        const timeoutId = setTimeout(() => {
          setCurrentText(currentText.slice(0, -1));
        }, eraseSpeed);
        return () => clearTimeout(timeoutId);
      } else {
        // Переход к следующему тексту
        setCurrentIndex((prevIndex) => (prevIndex + 1) % texts.length);
        setIsTyping(true);
      }
    }
  }, [currentText, currentIndex, isTyping, texts, typingSpeed, eraseSpeed, delayBetweenTexts]);

  return (
    <div className="bg-white p-2 max-w-2xl w-full rounded-md">
      <h1 className="text-center text-3xl font-bold">Typewriter Effect</h1>
      <p className="text-center text-lg">John Doe The <span className="font-bold">{currentText}</span></p>
    </div>
  );
};

export default Root;
