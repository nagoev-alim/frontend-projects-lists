import { useState } from 'react';

/**
 * @function TabsContainer
 * @description Компонент контейнера для вкладок, управляющий состоянием и отображением вкладок.
 * @param {Object} props - Свойства компонента.
 * @param {string} props.title - Заголовок контейнера вкладок.
 * @param {boolean} props.isVertical - Флаг, указывающий на вертикальное расположение вкладок.
 * @param {function} props.renderTabs - Функция для отрисовки заголовков вкладок.
 * @param {function} props.renderTabContent - Функция для отрисовки содержимого вкладок.
 * @returns {JSX.Element} JSX элемент, представляющий контейнер вкладок.
 */
const TabsContainer = ({ title, isVertical, renderTabs, renderTabContent }) => {
  // Индекс активной вкладки и функция для его обновления
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  // Общее количество вкладок
  const tabsCount = 3;

  /**
   * @function handleTabClick
   * @description Обрабатывает клик по вкладке, обновляя индекс активной вкладки.
   */
  const handleTabClick = (index) => setActiveTabIndex(index);

  // CSS классы для контейнера, зависящие от ориентации вкладок
  const containerClass = isVertical
    ? 'bg-white border grid rounded sm:grid-cols-[200px_auto] sm:items-start tabs-item tabs-item--vertical'
    : 'bg-white border grid rounded tabs-item--horizontal';

  return (
    <>
      <h3 className="font-bold md:text-4xl text-2xl text-center">{title}</h3>
      <div className={containerClass}>
        {renderTabs(isVertical, activeTabIndex, tabsCount, handleTabClick)}
        {renderTabContent(activeTabIndex, tabsCount)}
      </div>
    </>
  );
};

export default TabsContainer;
