/**
 * @module Loader
 * @description Модуль, предоставляющий компонент для отображения индикатора загрузки.
 */

import { square } from 'ldrs';
import PropTypes from 'prop-types';

// Регистрация компонента square из библиотеки ldrs
square.register();

/**
 * @function Loader
 * @description Компонент для отображения анимированного индикатора загрузки.
 *
 * @param {Object} props - Свойства компонента.
 * @param {boolean} [props.isLoading=false] - Флаг, указывающий, нужно ли отображать индикатор загрузки.
 *
 * @returns {JSX.Element|null} JSX элемент, представляющий индикатор загрузки, или null, если загрузка не активна.
 */
const Loader = ({ isLoading = false }) => {
  // Если isLoading false, компонент не рендерится
  if (!isLoading) return null;

  return (
    <div
      className="flex justify-center"
      aria-live="polite"
      aria-busy={true}
    >
      {/* 
        Компонент l-square из библиотеки ldrs для отображения анимированного квадрата.
        Параметры настройки анимации:
        - size: размер квадрата
        - stroke: толщина линии
        - stroke-length: длина штриха
        - bg-opacity: прозрачность фона
        - speed: скорость анимации
        - color: цвет квадрата
      */}
      <l-square
        size="35"
        stroke="5"
        stroke-length="0.25"
        bg-opacity="0.1"
        speed="1.2"
        color="black"
      ></l-square>
    </div>
  );
};

/**
 * @description Проверка типов свойств компонента с использованием PropTypes.
 */
Loader.propTypes = {
  isLoading: PropTypes.bool,
};

export default Loader;
