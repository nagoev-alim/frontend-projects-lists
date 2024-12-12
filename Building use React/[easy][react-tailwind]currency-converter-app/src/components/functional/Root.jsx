import { useCallback, useState } from 'react';
import axios from 'axios';
import { showToast } from '@utils';
import { CurrencySelectionPanel, ExchangeRateDisplay } from '@functional';
import CURRENCY_LIST from '../../mock/mock.js';
import { Button, Input } from '@ui';

/**
 * @constant {Object} CONSTANTS
 * @description Объект, содержащий константы, используемые в приложении конвертера валют.
 * @property {string} FLAG_API_URL - URL-адрес API для получения изображений флагов стран.
 * @property {string} CURRENCY_API_URL - URL-адрес API для конвертации валют.
 * @property {string} API_KEY - Ключ API для доступа к сервису конвертации валют.
 * @readonly
 */
const CONSTANTS = {
  FLAG_API_URL: 'https://flagcdn.com/48x36',
  CURRENCY_API_URL: 'https://api.apilayer.com/exchangerates_data/convert',
  API_KEY: '72QTpHHYt5e4JNuG2VCwerzkjph8ZNuB',
};


/**
 * @function Root
 * @description Компонент конвертера валют. Управляет состоянием и логикой конвертации валют.
 * @returns {JSX.Element} Возвращает JSX элемент, представляющий интерфейс конвертера валют.
 */
const Root = () => {
  /**
   * @constant {string} fromCurrencySelect - Выбранная исходная валюта.
   */
  const [fromCurrencySelect, setFromCurrencySelect] = useState('USD');

  /**
   * @constant {string} toCurrencySelect - Выбранная целевая валюта.
   */
  const [toCurrencySelect, setToCurrencySelect] = useState('RUB');

  /**
   * @constant {number} inputText - Введенная пользователем сумма для конвертации.
   */
  const [inputText, setInputText] = useState(1);

  /**
   * @constant {Object} flagUrl - Объект, содержащий URL-адреса флагов для исходной и целевой валют.
   */
  const [flagUrl, setFlagUrl] = useState({
    from: `${CONSTANTS.FLAG_API_URL}/us.png`,
    to: `${CONSTANTS.FLAG_API_URL}/ru.png`,
  });

  /**
   * @constant {boolean} isFetched - Флаг, указывающий, выполняется ли в данный момент запрос к API.
   */
  const [isFetched, setIsFetched] = useState(false);

  /**
   * @constant {Object|null} exchangeRate - Объект, содержащий информацию о курсе обмена.
   */
  const [exchangeRate, setExchangeRate] = useState(null);

  /**
   * @function handleInputChange
   * Обработчик изменения ввода для полей формы конвертера валют.
   * @description
   * Эта функция создает и возвращает обработчик события изменения ввода для полей формы.
   * Она выполняет следующие действия:
   * 1. Сбрасывает текущий курс обмена.
   * 2. Обрабатывает изменение выбора валюты, обновляя URL флага страны.
   * 3. Обновляет соответствующее состояние компонента с помощью переданной функции setter.
   */
  const handleInputChange = useCallback((setter) => (e) => {
    setExchangeRate(null);
    const { value, name, type } = e.target;

    if (type === 'select-one') {
      const selectedCountry = CURRENCY_LIST.find(currency => currency.name === value)?.value.toLowerCase();
      if (selectedCountry) {
        setFlagUrl(prevState => ({
          ...prevState,
          [name]: `${CONSTANTS.FLAG_API_URL}/${selectedCountry}.png`,
        }));
      }
    }

    setter(type === 'number' ? Number(value) : value);
  }, [setExchangeRate]);

  /**
   * @function fetchExchangeRate
   * Асинхронная функция для получения курса обмена валют.
   * @description
   * Эта функция выполняет следующие действия:
   * 1. Устанавливает флаг загрузки.
   * 2. Отправляет GET-запрос к API для получения курса обмена.
   * 3. Обновляет состояние компонента с полученными данными.
   * 4. Обрабатывает возможные ошибки и отображает уведомление.
   * 5. Сбрасывает флаг загрузки после завершения операции.
   */
  const fetchExchangeRate = useCallback(async (from, to, amount) => {
    try {
      setIsFetched(true);
      const response = await axios.get(CONSTANTS.CURRENCY_API_URL, {
        params: { to, from, amount },
        headers: { apikey: CONSTANTS.API_KEY },
      });

      const { result, date, info: { rate } } = response.data;

      setExchangeRate(prevState => ({
        ...prevState,
        result,
        date,
        rate,
      }));
    } catch (error) {
      showToast(`Error getting exchange rate: ${error.message}`, 'error');
      console.error(error.message);
      setExchangeRate(null);
    } finally {
      setIsFetched(false);
    }
  }, []);

  /**
   * @function handleFormSubmit
   * Обработчик отправки формы конвертера валют.
   * @description
   * Эта функция предотвращает стандартное поведение отправки формы и
   * вызывает функцию fetchExchangeRate для получения курса обмена.
   */
  const handleFormSubmit = useCallback(async (e) => {
    e.preventDefault();
    await fetchExchangeRate(fromCurrencySelect, toCurrencySelect, inputText);
  }, [fetchExchangeRate, fromCurrencySelect, toCurrencySelect, inputText]);

  /**
   * @function handleSwitchClick
   * Обработчик переключения валют местами.
   * @description
   * Эта функция выполняет следующие действия:
   * 1. Сбрасывает текущий курс обмена.
   * 2. Проверяет корректность введенной суммы.
   * 3. Меняет местами исходную и целевую валюты.
   * 4. Обновляет URL-адреса флагов для отображения.
   */
  const handleSwitchClick = useCallback(() => {
    setExchangeRate(null);
    const amount = Number(inputText);
    if (isNaN(amount) || amount <= 0) {
      showToast('Incorrect amount', 'error');
      return;
    }
    setFromCurrencySelect(toCurrencySelect);
    setToCurrencySelect(fromCurrencySelect);
    setFlagUrl(prevState => ({
      to: prevState.from,
      from: prevState.to,
    }));
  }, [inputText, toCurrencySelect, fromCurrencySelect]);

  return (
    <div className="grid gap-4 max-w-md w-full rounded border p-3 bg-white shadow">
      <h1 className="text-center text-2xl font-bold md:text-4xl">Currency Converter</h1>
      <form className="grid gap-3" onSubmit={handleFormSubmit}>
        <label className="grid gap-1">
          <span className="text-sm font-medium">Enter Amount</span>
          <Input
            type="number"
            step="1"
            min="1"
            name="amount"
            value={inputText}
            onChange={handleInputChange(setInputText)}
            aria-label="Amount to convert"
          />
        </label>
        <CurrencySelectionPanel
          fromCurrency={fromCurrencySelect}
          toCurrency={toCurrencySelect}
          fromFlag={flagUrl.from}
          toFlag={flagUrl.to}
          onFromChange={handleInputChange(setFromCurrencySelect)}
          onToChange={handleInputChange(setToCurrencySelect)}
          onSwitch={handleSwitchClick}
        />
        <ExchangeRateDisplay
          isFetched={isFetched}
          exchangeRate={exchangeRate}
          fromCurrency={fromCurrencySelect}
          toCurrency={toCurrencySelect}
          amount={inputText}
        />
        <Button type="submit">
          Get Exchange Rate
        </Button>
      </form>
    </div>
  );
};

export default Root;
