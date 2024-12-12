import { Controls } from '../components/functional';
import { BreweryList } from '../components/layout';

/**
 * Компонент домашней страницы.
 * Отображает элементы управления и список пивоварен.
 * 
 * @component
 * @returns {JSX.Element} Элемент React, представляющий домашнюю страницу.
 */
const HomePage = () => (
  <div className="grid gap-4">
    {/* Компонент с элементами управления (например, поиск, фильтрация) */}
    <Controls />
    {/* Компонент, отображающий список пивоварен */}
    <BreweryList />
  </div>
);

export default HomePage;
