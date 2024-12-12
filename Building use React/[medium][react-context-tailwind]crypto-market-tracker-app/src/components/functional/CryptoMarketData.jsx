/**
 * @module CryptoMarketData
 * @description Модуль, содержащий компонент CryptoMarketData для отображения данных криптовалютного рынка.
 */

import { useCryptoMarketContext } from '../../hooks/index.js';
import { Loader } from '../ui/index.js';
import { LANG } from '../../lang/index.js';
import { TableHead, TableBody } from './index.js';

/**
 * @function CryptoMarketData
 * @description Компонент для отображения данных криптовалютного рынка.
 *
 * @returns {React.ReactElement} Возвращает JSX элемент, представляющий интерфейс с данными криптовалютного рынка.
 *
 * @description
 * Компонент использует следующие хуки и данные:
 * - useCryptoMarketContext: для получения состояния загрузки (isLoading) и наличия ошибок (isError).
 *
 * Структура отображаемых элементов:
 * - Заголовок с названием (из LANG.title)
 * - Индикатор загрузки (Loader), если данные загружаются
 * - Сообщение об ошибке, если произошла ошибка
 * - Таблица с данными криптовалют (TableHead и TableBody), если данные успешно загружены
 *
 * Оптимизация производительности:
 * - Использование условного рендеринга для отображения соответствующего контента в зависимости от состояния (загрузка, ошибка, данные)
 * - Компоненты TableHead и TableBody вынесены в отдельные модули для возможной оптимизации их рендеринга
 */
const CryptoMarketData = () => {
  const { isLoading, isError } = useCryptoMarketContext();

  return (
    <div className="w-full max-w-6xl min-w-6xl mx-auto overflow-auto">
      <h1 className="font-bold text-lg xl:text-2xl p-3 text-center">{LANG.title}</h1>
      {isLoading && <Loader isLoading={isLoading} />}
      {isError && <p className="text-center text-red-500">{LANG.errors.errorMessage}</p>}
      {!isLoading && !isError && (
        <table className="w-full">
          <TableHead />
          <TableBody />
        </table>
      )}
    </div>
  );
};

export default CryptoMarketData;
