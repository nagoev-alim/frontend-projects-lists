import React, { memo, useEffect, useRef, useState } from 'react';
import { FiBell, FiBook, FiChevronDown, FiFolder, FiPlusCircle, FiSettings, FiUser } from 'react-icons/fi';

// Объект, содержащий иконки для использования в компоненте Dropdown.
const icons = {
  FiBell,
  FiBook,
  FiFolder,
  FiPlusCircle,
  FiSettings,
  FiUser,
};

// Массив mock-данных для отображения в выпадающем списке.
const MockData = [
  { ico: 'FiPlusCircle', label: 'Create New' },
  { ico: 'FiBook', label: 'All Drafts' },
  { ico: 'FiFolder', label: 'Move To' },
  { ico: 'FiUser', label: 'Profile Settings' },
  { ico: 'FiBell', label: 'Notification' },
  { ico: 'FiSettings', label: 'Settings' },
];

/**
 * Компонент выпадающего списка.
 * @param {Object} props - Свойства компонента.
 * @param {boolean} props.isOpen - Флаг, указывающий, открыт ли выпадающий список.
 * @param {Function} props.toggleDropdown - Функция для переключения состояния выпадающего списка.
 * @param {Array.<{ico: string, label: string}>} props.items - Массив элементов для отображения в выпадающем списке.
 * @returns {React.ReactElement} Возвращает JSX элемент выпадающего списка.
 */
const Dropdown = memo(({ isOpen, toggleDropdown, items }) => {
  return (
    <div className="dropdown w-full">
      <button
        className="dropdown__trigger w-full"
        onClick={toggleDropdown}
        aria-expanded={isOpen}
      >
        Dropdown
        <FiChevronDown className={isOpen ? 'dropdown__arrow dropdown__arrow--open' : 'dropdown__arrow'} />
      </button>
      {isOpen && (
        <ul className="dropdown__list show">
          {items.map((item, index) => {
            const Icon = icons[item.ico];
            return (
              <li key={index} className="dropdown__item">
                <a href="#" className="dropdown__link">
                  {Icon ? <Icon /> : null} {item.label}
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
});

/**
 * Корневой компонент приложения.
 * @returns {React.ReactElement} Возвращает JSX элемент корневого компонента.
 */
const Root = () => {
  // Состояние для отслеживания открытия/закрытия выпадающего списка
  const [isOpen, setIsOpen] = useState(false);
  // Реф для отслеживания клика вне выпадающего списка
  const dropdownRef = useRef(null);

  useEffect(() => {
    /**
     * Обработчик клика вне выпадающего списка.
     * @param {MouseEvent} event - Событие клика мыши.
     */
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    // Добавляем слушатель события при монтировании компонента
    document.addEventListener('mousedown', handleClickOutside);
    // Удаляем слушатель события при размонтировании компонента
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  /**
   * Функция для переключения состояния выпадающего списка.
   */
  const toggleDropdown = () => setIsOpen(!isOpen);

  return (
    <div className="grid w-full max-w-md gap-4 rounded border bg-white p-3 shadow">
      <h1 className="text-center text-2xl font-semibold">Dropdown UI</h1>
      <div className="components">
        <div className="component01 grid place-items-center" ref={dropdownRef}>
          <Dropdown
            isOpen={isOpen}
            toggleDropdown={toggleDropdown}
            items={MockData}
          />
        </div>
      </div>
    </div>
  );
};

export default Root;
