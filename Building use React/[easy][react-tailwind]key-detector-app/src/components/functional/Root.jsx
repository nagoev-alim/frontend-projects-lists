'use client';

import { useEffect, useState, useCallback } from 'react';

/**
 * Root - компонент для отображения информации о нажатой клавише.
 * Этот компонент отслеживает нажатия клавиш и отображает информацию о последней нажатой клавише,
 * включая её символ и код. Если клавиша еще не была нажата, компонент показывает приглашение нажать любую клавишу.
 * @returns {JSX.Element} Возвращает JSX элемент, отображающий информацию о нажатой клавише или приглашение нажать клавишу.
 */
function Root() {
  // Состояние, хранящее информацию о нажатой клавише.
  const [keyInfo, setKeyInfo] = useState({ key: '', keyCode: '', isPressed: false });

  /**
   * @function handleKeydown
   * Обработчик события нажатия клавиши.
   * @description Эта функция вызывается при нажатии любой клавиши. Она обновляет состояние keyInfo,
   * устанавливая информацию о нажатой клавише, включая сам символ, код клавиши и флаг, что клавиша была нажата.
   * Функция мемоизирована с помощью useCallback для оптимизации производительности.
   */
  const handleKeydown = useCallback((e) => {
    setKeyInfo({
      key: e.key,
      keyCode: e.keyCode,
      isPressed: true,
    });
  }, []);

  /**
   * @function keyPressEffect
   * Эффект для управления слушателем события нажатия клавиши.
   * @description Этот эффект добавляет слушатель события 'keydown' при монтировании компонента
   * и удаляет его при размонтировании. Это обеспечивает корректную работу обработчика нажатий клавиш
   * и предотвращает утечки памяти.
   * @returns {function} Функция очистки, которая удаляет слушатель события при размонтировании компонента.
   */
  useEffect(() => {
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [handleKeydown]);

  // Отображаемый символ клавиши. Заменяет пробел на 'Space'.
  const displayKey = keyInfo.key === ' ' ? 'Space' : keyInfo.key;

  return (
    <div className="bg-white border shadow rounded max-w-md w-full p-5 grid gap-4">
      {!keyInfo.isPressed ? (
        <p className="font-bold text-center text-2xl md:text-3xl">Press any key</p>
      ) : (
        <div className="grid gap-4">
          <div className="grid gap-2 place-items-center">
            <span
              className="inline-flex justify-center items-center text-red-400 uppercase font-bold text-4xl border-4 border-red-400 rounded p-5">
              {displayKey}
            </span>
            <span className="uppercase font-bold text-2xl text-red-400 md:text-4xl">
              {keyInfo.keyCode}
            </span>
          </div>
          <div className="grid grid-cols-2 place-items-center">
            <p className="font-bold text-2xl text-center w-full">
              Key: <span className="font-normal">{displayKey}</span>
            </p>
            <p className="font-bold text-2xl text-center border-l-2 border-slate-900 w-full">
              Code: <span className="font-normal">{keyInfo.keyCode}</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Root;
