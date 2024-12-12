/**
 * @module ModalWindow
 * @description Модуль, содержащий компонент ModalWindow для отображения подробной информации о криптовалюте.
 */

import { useCallback, useEffect, useRef } from 'react';
import { IoClose } from 'react-icons/io5';
import DOMPurify from 'dompurify';
import { useModalContext } from '../../hooks/index.js';
import { modalActions } from '../../context/index.js';
import { Button } from '../ui/index.js';

/**
 * @function ModalWindow
 * @description Компонент модального окна для отображения подробной информации о криптовалюте.
 *
 * @returns {React.ReactElement|null} Возвращает JSX элемент модального окна или null, если окно закрыто.
 *
 * @description
 * Компонент использует следующие хуки и данные:
 * - useModalContext: для получения состояния модального окна (isOpen, content) и функции dispatch.
 * - useCallback: для оптимизации функций handleModalClick и handleOverlayClick.
 * - useEffect: для обработки нажатия клавиши Escape и управления прокруткой body.
 * - useRef: для создания ссылки на DOM-элемент модального окна.
 *
 * Структура отображаемых данных:
 * - Название криптовалюты
 * - Ранг по рыночной капитализации
 * - Изображение и символ криптовалюты
 * - Текущая цена
 * - Статистика изменения цены за различные периоды
 * - Рыночные данные (24-часовой минимум/максимум, рыночная капитализация, циркулирующее предложение)
 * - Описание криптовалюты
 *
 * Компонент также включает кнопку закрытия и обработку кликов вне модального окна для его закрытия.
 *
 * Оптимизация производительности:
 * - Использование useCallback для мемоизации функций обработки событий.
 * - Условный рендеринг для предотвращения ненужных обновлений.
 * - Использование useEffect для управления побочными эффектами и очистки слушателей событий.
 */
const ModalWindow = () => {
  /**
   * @typedef {Object} ModalContextProps
   * @property {boolean} isOpen - Флаг, указывающий, открыто ли модальное окно.
   * @property {Object|null} content - Содержимое модального окна.
   * @property {Function} dispatch - Функция для отправки действий в контекст модального окна.
   */

  /** @type {ModalContextProps} */
  const { isOpen, content, dispatch } = useModalContext();

  /** @type {Object} Объект с действиями для управления модальным окном */
  const { handleToggleModal } = modalActions;

  /** @type {React.RefObject} Ссылка на DOM-элемент модального окна */
  const modalRef = useRef(null);

  /**
   * @function handleModalClick
   * @description Обработчик клика по модальному окну. Переключает состояние модального окна.
   */
  const handleModalClick = useCallback(() => {
    handleToggleModal(dispatch, { content: isOpen ? content : null, isOpen: !isOpen });
  }, [content, dispatch, handleToggleModal, isOpen]);

  /**
   * @function handleOverlayClick
   * @description Обработчик клика по оверлею. Закрывает модальное окно при клике вне его содержимого.
   * @param {React.MouseEvent} e - Событие клика.
   */
  const handleOverlayClick = useCallback((e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      handleModalClick();
    }
  }, [handleModalClick]);

  /**
   * @description Эффект для обработки нажатия клавиши Escape.
   */
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && isOpen) handleModalClick();
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [isOpen, handleModalClick]);

  /**
   * @description Эффект для управления прокруткой body при открытии/закрытии модального окна.
   */
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'auto';
  }, [isOpen]);

  if (!isOpen || !content) return null;

  /**
   * @function renderStatistics
   * @description Рендерит статистику изменения цены за различные периоды.
   * @returns {React.ReactElement[]} Массив JSX элементов со статистикой.
   */
  const renderStatistics = () => {
    const periods = ['1h', '24h', '7d', '14d', '30d', '1yr'];
    return periods.map((period) => {
      const key = period === '1yr' ? '1y' : period;
      const value = content.market_data?.[`price_change_percentage_${key}_in_currency`]?.usd;
      if (value === undefined) return null;
      return (
        <li key={period}>
          <p>
            <span className="font-bold uppercase">{period}:</span> {value.toFixed(1)}%
          </p>
        </li>
      );
    });
  };

  /**
   * @function renderMarketData
   * @description Рендерит рыночные данные криптовалюты.
   * @returns {React.ReactElement[]} Массив JSX элементов с рыночными данными.
   */
  const renderMarketData = () => {
    const dataPoints = [
      { label: '24 Hour Low', value: content.market_data?.low_24h?.usd },
      { label: '24 Hour High', value: content.market_data?.high_24h?.usd },
      { label: 'Market Cap', value: content.market_data?.market_cap?.usd },
      { label: 'Circulating Supply', value: content.market_data?.circulating_supply },
    ];

    return dataPoints.map(({ label, value }) => {
      if (value === undefined) return null;
      return (
        <li key={label}>
          <p>
            <span className="font-bold uppercase">{label}:</span>
            {' '}
            {label !== 'Circulating Supply' ? '$' : ''}
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
        </li>
      );
    });
  };

  return (
    <div className="fixed inset-0 bg-neutral-900/50 grid place-items-center p-3 overflow-auto"
         onClick={handleOverlayClick}>
      <section className="bg-white p-4 rounded max-w-6xl relative grid gap-4" ref={modalRef}>
        <button className="absolute top-2 right-2" onClick={handleModalClick} aria-label="Close">
          <IoClose className="text-2xl" />
        </button>
        <div className="grid gap-2">
          <div className="flex justify-center gap-2 items-center">
            <h1 className="font-bold text-lg xl:text-2xl text-center">About {content.name}</h1>
            <span
              className="text-xs font-semibold uppercase p-1 text-green-800 bg-green-200 rounded-lg">Rank # {content.market_cap_rank}</span>
          </div>

          <div className="flex items-center justify-center gap-2">
            {content.image && <img src={content.image.small} alt={content.name} />}
            {content.symbol && <p className="font-bold">{content.symbol.toUpperCase()}/USD</p>}
          </div>

          {content.market_data?.current_price && (
            <p className="flex justify-center">
              <span
                className="rounded border border-amber-500 p-1.5 text-2xl tracking-wider text-yellow-800 bg-yellow-200 bg-opacity-40">
                ${content.market_data.current_price.usd.toLocaleString()}
              </span>
            </p>
          )}

          <h2 className="text-xl font-semibold mb-1">Statistics:</h2>
          <ul className="grid gap-2 p-2 border">
            {renderStatistics()}
          </ul>

          <ul className="grid gap-2 p-2 border">
            {renderMarketData()}
          </ul>


          {content.description?.en && content.description?.en.trim().length !== 0 && (
            <>
              <h2 className="text-xl font-semibold mb-1">Description:</h2>
              <p className="p-2 border rounded" dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(content.description.en),
              }} />
            </>
          )}
          <Button className="w-full" onClick={handleModalClick}>Close Modal</Button>
        </div>
      </section>
    </div>
  );
};

export default ModalWindow;
