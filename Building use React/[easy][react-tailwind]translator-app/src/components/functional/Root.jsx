import React, { useState, useCallback } from 'react';
import axios from 'axios';
import { languages } from '@mock';
import { copyToClipboard, showToast } from '@utils';
import { FaRegClipboard } from 'react-icons/fa';
import { BiVolumeFull } from 'react-icons/bi';
import { FiRefreshCw } from 'react-icons/fi';
import { Button, Select, Textarea } from '@ui';

/**
 * URL API для перевода текста.
 * @constant {string}
 */
const API_URL = 'https://api.mymemory.translated.net/get';

/**
 * Корневой компонент приложения для перевода текста.
 * @returns {JSX.Element} Возвращает JSX разметку компонента переводчика.
 */
const Root = () => {
  // Состояния для хранения текста, языков и статуса перевода
  const [sourceText, setSourceText] = useState('');
  const [targetText, setTargetText] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('en-GB');
  const [targetLanguage, setTargetLanguage] = useState('ru-RU');
  const [isTranslating, setIsTranslating] = useState(false);

  /**
   * Обработчик ошибок.
   * @param {string} message - Сообщение об ошибке.
   * @param {Error} [error=null] - Объект ошибки (необязательный).
   */
  const handleError = useCallback((message, error = null) => {
    showToast(message, 'error');
    if (error) console.error(message, error);
  }, []);

  /**
   * Выполняет перевод текста.
   */
  const handleTranslate = useCallback(async () => {
    if (!sourceText.trim()) {
      showToast('Please enter some text', 'error');
      return;
    }

    setIsTranslating(true);
    try {
      // Отправка запроса на перевод
      const { data: { responseData: { translatedText } } } = await axios.get(API_URL, {
        params: {
          q: sourceText,
          langpair: `${sourceLanguage}|${targetLanguage}`,
        },
      });
      setTargetText(translatedText);
    } catch (error) {
      handleError('Error during translation', error);
    } finally {
      setIsTranslating(false);
    }
  }, [sourceText, sourceLanguage, targetLanguage, handleError]);

  /**
   * Меняет местами исходный и целевой языки, а также их тексты.
   */
  const handleSwapLanguages = useCallback(() => {
    setSourceText(targetText);
    setTargetText(sourceText);
    setSourceLanguage(targetLanguage);
    setTargetLanguage(sourceLanguage);
  }, [sourceText, targetText, sourceLanguage, targetLanguage]);

  /**
   * Озвучивает текст с использованием SpeechSynthesis API.
   * @param {string} text - Текст для озвучивания.
   * @param {string} lang - Код языка для озвучивания.
   */
  const handleSpeak = useCallback((text, lang) => {
    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      speechSynthesis.speak(utterance);
    } catch (error) {
      handleError('Failed to speak', error);
    }
  }, [handleError]);

  /**
   * Рендерит элементы управления для выбора языка и дополнительных действий.
   * @param {string} text - Текст для копирования или озвучивания.
   * @param {string} language - Текущий выбранный язык.
   * @param {function} setLanguage - Функция для изменения языка.
   * @param {boolean} isSource - Флаг, указывающий, является ли это исходным языком.
   * @returns {JSX.Element} Возвращает JSX разметку элементов управления.
   */
  const renderLanguageControls = useCallback((text, language, setLanguage, isSource) => (
    <div className={`grid ${isSource ? 'grid-cols-[auto_1fr]' : 'grid-cols-[1fr_auto]'} gap-2`}>
      {isSource && (
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" onClick={() => copyToClipboard(text)}>
            <FaRegClipboard />
          </Button>
          <Button variant="outline" onClick={() => handleSpeak(text, language)}>
            <BiVolumeFull />
          </Button>
        </div>
      )}
      <Select
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        options={languages.map(({ value, name }) => ({ value, label: name }))}
      />
      {!isSource && (
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" onClick={() => copyToClipboard(text)}>
            <FaRegClipboard />
          </Button>
          <Button variant="outline" onClick={() => handleSpeak(text, language)}>
            <BiVolumeFull />
          </Button>
        </div>
      )}
    </div>
  ), [handleSpeak]);

  // Рендер компонента
  return (
    <div className="grid w-full max-w-2xl gap-4 rounded border bg-white p-3 shadow">
      <h1 className="text-center text-2xl font-bold md:text-3xl">Translator</h1>
      <div className="grid gap-3">
        <div className="grid gap-3 md:grid-cols-2">
          <Textarea
            className="min-h-[130px]"
            placeholder="Enter text"
            resizeNone={true}
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
          />
          <Textarea
            className="min-h-[130px]"
            placeholder="Translation"
            value={targetText}
            readOnly
            resizeNone={true}
            disabled
          />
        </div>

        <div className="grid gap-3 md:grid-cols-[1fr_auto_1fr]">
          {renderLanguageControls(sourceText, sourceLanguage, setSourceLanguage, true)}
          <div className="flex justify-center">
            <Button variant="outline" onClick={handleSwapLanguages}>
              <FiRefreshCw />
            </Button>
          </div>
          {renderLanguageControls(targetText, targetLanguage, setTargetLanguage, false)}
        </div>
      </div>

      <Button onClick={handleTranslate} disabled={isTranslating}>
        {isTranslating ? 'Translating...' : 'Translate Text'}
      </Button>
    </div>
  );
};

export default Root;
