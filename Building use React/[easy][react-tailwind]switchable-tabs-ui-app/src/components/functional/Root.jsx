/**
 * @fileoverview Компонент Root для создания вкладок с горизонтальным и вертикальным расположением.
 * Этот компонент позволяет создавать интерактивные вкладки с настраиваемым содержимым.
 */

import { TabsContainer } from '@functional';

/**
 * @function Root
 * @description Основной компонент для создания вкладок.
 * @returns {JSX.Element} JSX элемент, содержащий горизонтальные и вертикальные вкладки.
 */
const Root = () => {
  /**
   * @function renderTabs
   * @description Отрисовывает заголовки вкладок.
   * @param {boolean} isVertical - Флаг вертикального расположения вкладок.
   * @param {number} index - Индекс активной вкладки.
   * @param {number} tabsCount - Общее количество вкладок.
   * @param {function} handleTabClick - Функция обработки клика по вкладке.
   * @returns {JSX.Element} Список заголовков вкладок.
   */
  const renderTabs = (isVertical, index, tabsCount, handleTabClick) => (
    <ul className={isVertical ? 'grid sm:border-r-2' : 'grid sm:grid-cols-3'}>
      {Array.from({ length: tabsCount }).map((_, i) => (
        <li
          key={i}
          onClick={() => handleTabClick(i)}
          className={`border cursor-pointer font-bold p-3 ${
            i === index ? 'active bg-slate-900 text-white' : 'text-black'
          }`}
        >
          Tab {i + 1}
        </li>
      ))}
    </ul>
  );

  /**
   * @function renderTabContent
   * @description Отрисовывает содержимое вкладок.
   * @param {number} index - Индекс активной вкладки.
   * @param {number} tabsCount - Общее количество вкладок.
   * @returns {JSX.Element} Список с содержимым вкладок.
   */
  const renderTabContent = (index, tabsCount) => (
    <ul className="relative tabs__body overflow-hidden">
      {Array.from({ length: tabsCount }).map((_, i) => (
        <li key={i} className={`border cursor-pointer font-bold p-3 ${i === index ? 'active' : ''}`}>
          <h3 className="font-bold text-lg">Tab {i + 1}</h3>
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quisquam, sequi!
        </li>
      ))}
    </ul>
  );

  return (
    <div className="tabs gap-5 grid">
      <TabsContainer
        title="Horizontal Tabs"
        isVertical={false}
        renderTabs={renderTabs}
        renderTabContent={renderTabContent}
      />
      <TabsContainer
        title="Vertical Tabs"
        isVertical={true}
        renderTabs={renderTabs}
        renderTabContent={renderTabContent}
      />
    </div>
  );
};

export default Root;
