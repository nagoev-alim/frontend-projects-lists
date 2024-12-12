/**
 * Этот код реализует функциональность преобразования текста в речь (Text-to-Speech).
 * Он создает пользовательский интерфейс с формой ввода текста и выбором голоса,
 * использует Web Speech API для синтеза речи и управляет состоянием приложения.
 */

import './style.css';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';

/**
 * Конфигурация приложения
 * @typedef {Object} AppConfig
 * @property {string} root - Селектор корневого элемента
 * @property {Object} selectors - Селекторы элементов формы
 */
const APP_CONFIG = {
  root: '#app',
  selectors: {
    form: '[data-tts-form]',
    voiceSelect: '[data-tts-voice-select]',
  },
};

/**
 * Состояние приложения
 * @typedef {Object} AppState
 * @property {Object} elements - DOM элементы
 * @property {SpeechSynthesis|null} synth - Объект синтеза речи
 * @property {boolean} isSpeaking - Флаг, указывающий, идет ли в данный момент речь
 */
const APP_STATE = {
  elements: {
    form: null,
    voiceSelect: null,
    formButton: null,
  },
  synth: null,
  isSpeaking: true,
};

/**
 * Утилиты приложения
 * @typedef {Object} AppUtils
 * @property {Function} renderDataAttributes - Функция для рендеринга data-атрибутов
 * @property {Object} toastConfig - Конфигурация для уведомлений
 * @property {Function} showToast - Функция для отображения уведомлений
 */
const APP_UTILS = {
  /**
   * Преобразует селектор в data-атрибут
   * @param {string} element - Селектор элемента
   * @returns {string} Data-атрибут
   */
  renderDataAttributes: (element) => element.slice(1, -1),

  /**
   * Конфигурация для уведомлений
   */
  toastConfig: {
    className: 'bg-none shadow-none bg-orange-100 text-black border border-orange-200',
    duration: 3000,
    gravity: 'bottom',
    position: 'center',
  },

  /**
   * Отображает уведомление
   * @param {string} message - Текст уведомления
   */
  showToast: (message) => {
    Toastify({
      text: message,
      ...APP_UTILS.toastConfig,
    }).showToast();
  },
};

/**
 * Создает HTML-разметку приложения
 */
function createAppHTML() {
  const {
    root,
    selectors: { form, voiceSelect },
  } = APP_CONFIG;
  const { renderDataAttributes } = APP_UTILS;
  const rootElement = document.querySelector(root);

  if (!rootElement) return;

  rootElement.innerHTML = `
    <div class='grid max-w-md w-full gap-4 rounded border bg-white p-3 shadow'>
      <h1 class='text-center text-2xl font-bold md:text-4xl'>Text To Speech</h1>
      <form class='grid gap-3' ${renderDataAttributes(form)}>
        <label class='grid gap-1'>
          <span class='font-medium'>Enter Text</span>
          <textarea 
            class='w-full min-h-[150px] resize-none rounded border bg-slate-50 px-3 py-2 focus:border-blue-400 focus:outline-none' 
            name='text'
          ></textarea>
        </label>
        <label class='grid gap-1'>
          <span class='font-medium'>Select Voice</span>
          <select 
            class='w-full rounded border bg-slate-50 px-3 py-2 focus:border-blue-400 focus:outline-none' 
            name='voices' 
            ${renderDataAttributes(voiceSelect)}
          ></select>
        </label>
        <button class='border px-3 py-2 hover:bg-slate-50'>Convert To Speech</button>
      </form>
    </div>
  `;
}

/**
 * Инициализирует DOM элементы
 */
function initDOMElements() {
  APP_STATE.elements = {
    form: document.querySelector(APP_CONFIG.selectors.form),
    formButton: document.querySelector(`${APP_CONFIG.selectors.form} button`),
    voiceSelect: document.querySelector(APP_CONFIG.selectors.voiceSelect),
  };
}

/**
 * Инициализирует приложение
 */
function initApp() {
  createAppHTML();
  initDOMElements();
  APP_STATE.synth = speechSynthesis;
  getVoices();
  APP_STATE.synth?.addEventListener('voiceschanged', getVoices);
  APP_STATE.elements.form?.addEventListener('submit', handleFormSubmit);
}

/**
 * Получает доступные голоса и обновляет выпадающий список
 */
function getVoices() {
  if (!APP_STATE.synth) return;

  const voices = APP_STATE.synth.getVoices();
  const defaultVoice = 'Google US English';

  const options = voices
    .map(
      ({ name, lang }) =>
        `<option value="${name}" ${
          name === defaultVoice ? 'selected' : ''
        }>${name} (${lang})</option>`
    )
    .join('');

  APP_STATE.elements.voiceSelect.innerHTML = options;
}

/**
 * Обрабатывает отправку формы
 * @param {Event} event - Событие отправки формы
 */
function handleFormSubmit(event) {
  event.preventDefault();
  const text = event.target.text.value.trim();

  if (!text) {
    APP_UTILS.showToast('Please enter or paste something');
    return;
  }

  if (APP_STATE.synth && !APP_STATE.synth.speaking) {
    tts(text);
  }

  updateButtonState(text);
}

/**
 * Преобразует текст в речь
 * @param {string} text - Текст для преобразования
 */
function tts(text) {
  if (!APP_STATE.synth) return;

  const utterance = new SpeechSynthesisUtterance(text);
  const selectedVoice = APP_STATE.synth
    .getVoices()
    .find((voice) => voice.name === APP_STATE.elements.voiceSelect.value);

  if (selectedVoice) {
    utterance.voice = selectedVoice;
  }

  APP_STATE.synth.speak(utterance);
}

/**
 * Обновляет состояние кнопки в зависимости от длины текста
 * @param {string} text - Введенный текст
 */
function updateButtonState(text) {
  if (text.length > 80) {
    setInterval(checkSpeechStatus, 500);
    toggleSpeechState();
  } else {
    APP_STATE.elements.formButton.textContent = 'Convert To Speech';
  }
}

/**
 * Проверяет статус речи и обновляет состояние
 */
function checkSpeechStatus() {
  if (APP_STATE.synth && !APP_STATE.synth.speaking && !APP_STATE.isSpeaking) {
    APP_STATE.isSpeaking = true;
    APP_STATE.elements.formButton.textContent = 'Convert To Speech';
  }
}

/**
 * Переключает состояние речи (пауза/возобновление)
 */
function toggleSpeechState() {
  if (APP_STATE.isSpeaking) {
    if (APP_STATE.synth) {
      APP_STATE.synth.resume();
      APP_STATE.isSpeaking = false;
      APP_STATE.elements.formButton.textContent = 'Pause Speech';
    }
  } else {
    if (APP_STATE.synth) {
      APP_STATE.synth.pause();
      APP_STATE.isSpeaking = true;
      APP_STATE.elements.formButton.textContent = 'Resume Speech';
    }
  }
}

initApp();
