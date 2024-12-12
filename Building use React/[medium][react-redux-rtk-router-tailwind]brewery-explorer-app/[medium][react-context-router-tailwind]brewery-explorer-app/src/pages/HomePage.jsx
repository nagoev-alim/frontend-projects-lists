/**
 * @fileoverview Компонент домашней страницы приложения.
 * @module HomePage
 */

import { Controls } from '../components/functional/index';
import { BreweryList } from '../components/layout/index';

/**
 * @function HomePage
 * @description Компонент, отображающий домашнюю страницу приложения.
 * Включает в себя элементы управления и список пивоварен.
 * 
 * @returns {JSX.Element} JSX элемент, представляющий домашнюю страницу.
 */
const HomePage = () => (
  // Контейнер с отступами между дочерними элементами
  <div className="grid gap-4">
    {/* Компонент с элементами управления (поиск, фильтрация и т.д.) */}
    <Controls />
    {/* Компонент, отображающий список пивоварен */}
    <BreweryList />
  </div>
)

export default HomePage;
