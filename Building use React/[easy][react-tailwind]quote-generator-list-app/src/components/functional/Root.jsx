import React, { useState } from 'react';
import axios from 'axios';
import apiEndpoints from '@mock/mock';
import { copyToClipboard, showToast } from '@utils';
import { FaRegClipboard } from 'react-icons/fa';
import { Button } from '@ui';

/**
 * @typedef {Object} Quote
 * @property {string} text - Текст цитаты
 * @property {string|boolean} author - Автор цитаты или false, если автор неизвестен
 */

/**
 * Корневой компонент приложения для генерации цитат
 * @returns {JSX.Element} Возвращает JSX разметку компонента
 */
const Root = () => {
  // Состояние для хранения выбранного источника цитат
  const [source, setSource] = useState('');
  // Состояние для хранения текущей цитаты
  const [quote, setQuote] = useState(null);
  // Состояние для отображения индикатора загрузки
  const [loading, setLoading] = useState(false);

  /**
   * Получает данные цитаты из выбранного источника
   * @param {string} source - URL источника цитат
   * @returns {Promise<Object>} Промис с данными ответа
   */
  const fetchQuoteData = async (source) => {
    if (source === 'https://api.api-ninjas.com/v1/quotes') {
      return axios.get(source, {
        headers: { 'X-Api-Key': 'akxWnVBvUmGAjheE9llulw==TVZ6WIhfWDdCsx9o' },
      });
    }
    return axios.get(source);
  };

  /**
   * Обрабатывает полученные данные и устанавливает цитату
   * @param {Object|Array} data - Данные, полученные от API
   */
  const processQuoteData = (data) => {
    if (Array.isArray(data)) {
      handleArrayData(data);
    } else if (data.value) {
      setQuote({ text: data.value, author: false });
    } else if (data.author && data.content) {
      setQuote({ text: data.content, author: data.author });
    } else if (data.author && data.quote) {
      setQuote({ text: data.quote, author: data.author });
    } else if (data.quoteText && data.quoteAuthor) {
      setQuote({ text: data.quoteText, author: data.quoteAuthor });
    } else if (data.punchline && data.setup) {
      setQuote({ text: data.setup, author: data.punchline });
    } else if (data.quote && typeof data.quote === 'object') {
      handleQuoteObject(data.quote);
    } else if (data.insult) {
      setQuote({ text: data.insult, author: false });
    } else if (data.affirmation) {
      setQuote({ text: data.affirmation, author: false });
    }
  };

  /**
   * Обрабатывает массив данных и устанавливает случайную цитату
   * @param {Array} data - Массив данных цитат
   */
  const handleArrayData = (data) => {
    if (data.length === 1) {
      setQuote({ text: data[0], author: false });
    } else {
      const { text, author, yoast_head_json } = data[Math.floor(Math.random() * data.length)];
      if (yoast_head_json) {
        setQuote({ text: yoast_head_json.og_description, author: yoast_head_json.og_title });
      } else {
        setQuote({ text, author });
      }
    }
  };

  /**
   * Обрабатывает объект цитаты и устанавливает его значения
   * @param {Object} quote - Объект с данными цитаты
   */
  const handleQuoteObject = (quote) => {
    if (quote.author && quote.body) {
      setQuote({ text: quote.body, author: quote.author });
    }
  };

  /**
   * Обрабатывает отправку формы и получение новой цитаты
   * @param {Event} event - Событие отправки формы
   */
  const handleFormSubmit = async (event) => {
    event.preventDefault();
    if (!source) {
      showToast('Please select source', 'error');
      return;
    }
    setLoading(true);
    try {
      const { data } = await fetchQuoteData(source);
      processQuoteData(data);
    } catch (error) {
      showToast('Failed to fetch quote', 'error');
      setQuote(null);
    } finally {
      setLoading(false);
      setSource('');
    }
  };

  // Возвращаем JSX разметку компонента
  return (
    <div className="grid w-full max-w-md gap-4 rounded border bg-white p-3 shadow">
      <h1 className="text-center text-2xl font-bold">Quote Generators</h1>
      <form className="grid gap-3" onSubmit={handleFormSubmit}>
        <select
          className="w-full cursor-pointer border-2 bg-slate-50 px-3 py-2 focus:border-blue-400 focus:outline-none"
          value={source}
          onChange={(e) => setSource(e.target.value)}
        >
          <option value="">Select Source</option>
          {apiEndpoints.map(({ name, value }) => (
            <option key={value} value={value}>{name}</option>
          ))}
        </select>
        <Button type="submit" disabled={loading}>{loading ? 'Loading...' : 'Submit'}</Button>
      </form>
      {quote && (
        <div className="grid rounded border bg-gray-50 p-2">
          <button className="ml-auto" onClick={() => copyToClipboard(quote.text)}>
            <FaRegClipboard />
          </button>
          <p>"{quote.text}"</p>
          {quote.author && <p>{quote.author}</p>}
        </div>
      )}
    </div>
  );
};

export default Root;
