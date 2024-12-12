import { useEffect, useRef, useCallback } from 'react';
import { drumData } from '@mock';

/**
 * Компонент Root для создания интерактивной барабанной установки.
 * @returns {JSX.Element} Возвращает JSX элемент с барабанной установкой.
 */
const Root = () => {
  // Реф для доступа к списку барабанов в DOM
  const drumListRef = useRef(null);
  // Реф для управления аудио элементом
  const audioRef = useRef(new Audio());

  /**
   * Обработчик нажатия клавиши.
   * @param {KeyboardEvent} event - Событие нажатия клавиши.
   */
  const handleKeyDown = useCallback((event) => {
    const key = event.key.toLowerCase();
    const drum = drumData.find(d => d.key === key);
    if (drum) {
      playDrum(drum.key);
    }
  }, []);

  // Эффект для добавления и удаления обработчика нажатия клавиши
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  /**
   * Обработчик клика по барабану.
   * @param {MouseEvent} event - Событие клика мыши.
   */
  const handleDrumClick = useCallback((event) => {
    const key = event.target.dataset.drumKey;
    if (key) {
      playDrum(key);
    }
  }, []);

  /**
   * Воспроизводит звук барабана и анимирует его.
   * @param {string} key - Ключ барабана.
   */
  const playDrum = useCallback((key) => {
    const drum = drumData.find(d => d.key === key);
    if (drum) {
      animate(key);
      play(drum.sound);
    }
  }, []);

  /**
   * Анимирует нажатие барабана.
   * @param {string} key - Ключ барабана.
   */
  const animate = useCallback((key) => {
    const element = drumListRef.current.querySelector(`[data-drum-key="${key}"]`);
    if (element) {
      element.classList.add('pressed');
      setTimeout(() => element.classList.remove('pressed'), 300);
    }
  }, []);

  /**
   * Воспроизводит звук барабана.
   * @param {string} audioSrc - Путь к аудиофайлу.
   */
  const play = useCallback((audioSrc) => {
    audioRef.current.src = audioSrc;
    audioRef.current.currentTime = 0;
    audioRef.current.play();
  }, []);

  return (
    <div className="drum-kit grid w-full max-w-8xl gap-4 rounded border bg-white p-3 shadow">
      <h1 className="text-center text-2xl font-bold md:text-3xl">Drum 🥁 Kit</h1>
      <ul ref={drumListRef} onClick={handleDrumClick}>
        {drumData.map(({ key, image, sound }) => (
          <li
            key={key}
            className={`${key} border-2`}
            style={{ backgroundImage: `url('${image}')` }}
            data-drum-key={key}
            data-drum-sound={sound}
          >
            {key}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Root;
