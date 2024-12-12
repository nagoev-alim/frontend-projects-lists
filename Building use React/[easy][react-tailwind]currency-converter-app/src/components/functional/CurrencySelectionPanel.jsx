import { CurrencySelect } from '@functional';
import { GoArrowSwitch } from 'react-icons/go';
import { Button } from '@ui';

/**
 * Компонент панели выбора валют.
 * @param {Object} props - Свойства компонента.
 * @param {string} props.fromCurrency - Код исходной валюты.
 * @param {string} props.toCurrency - Код целевой валюты.
 * @param {string} props.fromFlag - URL изображения флага для исходной валюты.
 * @param {string} props.toFlag - URL изображения флага для целевой валюты.
 * @param {Function} props.onFromChange - Обработчик изменения исходной валюты.
 * @param {Function} props.onToChange - Обработчик изменения целевой валюты.
 * @param {Function} props.onSwitch - Обработчик переключения валют.
 * @returns {JSX.Element} Возвращает JSX элемент с панелью выбора валют.
 * @description
 * Этот компонент отображает панель для выбора исходной и целевой валют,
 * а также кнопку для их переключения. Он использует компоненты CurrencySelect
 * для каждой валюты и SwitchButton для переключения между ними.
 */
const CurrencySelectionPanel = ({
                                  fromCurrency,
                                  toCurrency,
                                  fromFlag,
                                  toFlag,
                                  onFromChange,
                                  onToChange,
                                  onSwitch,
                                }) => (
  <div className="grid gap-3 sm:grid-cols-[1fr_40px_1fr] sm:items-end">
    <CurrencySelect
      label="From"
      value={fromCurrency}
      onChange={onFromChange}
      flagUrl={fromFlag}
      ariaLabel="Select source currency"
    />
    <Button
      className="flex justify-center items-center w-10 h-10 !p-0"
      variant='outline'
      onClick={onSwitch}
      aria-label="Переключить валюты"
      type="button"
    >
      <GoArrowSwitch size={24} />
    </Button>
    <CurrencySelect
      label="To"
      value={toCurrency}
      onChange={onToChange}
      flagUrl={toFlag}
      ariaLabel="Select target currency"
    />
  </div>
);

export default CurrencySelectionPanel;
