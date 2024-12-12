import { useState, useEffect, useRef, useCallback } from 'react';
import { showToast } from '@utils';
import { Button, Select, Textarea } from '@ui';

/**
 * Корневой компонент для преобразования текста в речь
 * @returns {JSX.Element} Возвращает JSX элемент с формой для ввода текста и выбора голоса
 */
const Root = () => {
  // Состояния для управления текстом, голосами и состоянием речи
  const [text, setText] = useState('');
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const synthRef = useRef(null);

  /**
   * Обновляет список доступных голосов
   */
  const updateVoices = useCallback(() => {
    const availableVoices = synthRef.current.getVoices();
    setVoices(availableVoices);
    // Устанавливает Google US English как голос по умолчанию, если доступен
    setSelectedVoice(availableVoices.find(voice => voice.name === 'Google US English')?.name || '');
  }, []);

  useEffect(() => {
    // Инициализация объекта синтеза речи
    synthRef.current = window.speechSynthesis;
    synthRef.current.addEventListener('voiceschanged', updateVoices);
    updateVoices();

    // Очистка слушателя событий при размонтировании компонента
    return () => {
      synthRef.current.removeEventListener('voiceschanged', updateVoices);
    };
  }, [updateVoices]);

  /**
   * Преобразует текст в речь
   * @param {string} text - Текст для преобразования в речь
   */
  const tts = useCallback((text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    const voice = voices.find(v => v.name === selectedVoice);
    if (voice) utterance.voice = voice;
    synthRef.current.speak(utterance);
  }, [voices, selectedVoice]);

  /**
   * Проверяет статус речи и обновляет состояние
   */
  const checkSpeechStatus = useCallback(() => {
    if (synthRef.current && !synthRef.current.speaking && !isSpeaking) {
      setIsSpeaking(true);
    }
  }, [isSpeaking]);

  /**
   * Переключает состояние речи между паузой и возобновлением
   */
  const toggleSpeechState = useCallback(() => {
    if (isSpeaking) {
      synthRef.current?.resume();
      setIsSpeaking(false);
    } else {
      synthRef.current?.pause();
      setIsSpeaking(true);
    }
  }, [isSpeaking]);

  /**
   * Обновляет состояние кнопки в зависимости от длины текста
   * @param {string} text - Текст для проверки
   */
  const updateButtonState = useCallback((text) => {
    if (text.length > 80) {
      setInterval(checkSpeechStatus, 500);
      toggleSpeechState();
    }
  }, [checkSpeechStatus, toggleSpeechState]);

  /**
   * Обрабатывает отправку формы
   * @param {React.FormEvent<HTMLFormElement>} e - Событие отправки формы
   */
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (!text.trim()) {
      showToast('Please enter or paste something', 'error');
      return;
    }
    if (synthRef.current && !synthRef.current.speaking) {
      tts(text);
    }
    updateButtonState(text);
  }, [text, tts, updateButtonState]);

  return (
    <div className="grid max-w-md w-full gap-4 rounded border bg-white p-3 shadow">
      <h1 className="text-center text-2xl font-bold md:text-4xl">Text To Speech</h1>
      <form className="grid gap-3" onSubmit={handleSubmit}>
        <label className="grid gap-1">
          <span className="font-medium">Enter Text</span>
          <Textarea
            className="w-full min-h-[150px]"
            placeholder="Enter your text here..."
            fullWidth={true}
            resizeNone={true}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </label>
        <label className="grid gap-1">
          <span className="font-medium">Select Voice</span>
          <Select
            fullWidth={true}
            value={selectedVoice}
            onChange={(e) => setSelectedVoice(e.target.value)}
            options={voices.map((voice) => ({
              label: voice.name,
              value: `${voice.name} ${voice.lang}`,
            }))}
          />
        </label>
        <Button type="submit">{isSpeaking ? 'Resume Speech' : 'Convert To Speech'}</Button>
      </form>
    </div>
  );
};

export default Root;
