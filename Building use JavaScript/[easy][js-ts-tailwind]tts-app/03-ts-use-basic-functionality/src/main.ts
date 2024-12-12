/**
 * Этот код реализует функционал преобразования текста в речь (Text-to-Speech).
 * Он позволяет пользователю ввести текст, выбрать голос и преобразовать текст в речь.
 * Код также обеспечивает управление воспроизведением речи (пауза/возобновление).
 */

import './style.css';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';

/**
 * Интерфейс для конфигурации приложения
 */
interface AppConfig {
  root: string;
  selectors: {
    form: string;
    voiceSelect: string;
  };
}

/**
 * Интерфейс для состояния приложения
 */
interface AppState {
  elements: {
    form: HTMLFormElement | null;
    voiceSelect: HTMLSelectElement | null;
    formButton: HTMLButtonElement | null;
  };
  synth: SpeechSynthesis | null;
  isSpeaking: boolean;
}

/**
 * Интерфейс для утилит приложения
 */
interface AppUtils {
  renderDataAttributes: (element: string) => string;
  toastConfig: {
    className: string;
    duration: number;
    gravity: string;
    position: string;
  };
  showToast: (message: string) => void;
}

/**
 * Конфигурация приложения
 */
const APP_CONFIG: AppConfig = {
  root: '#app',
  selectors: {
    form: '[data-tts-form]',
    voiceSelect: '[data-tts-voice-select]',
  },
};

/**
 * Состояние приложения
 */
const APP_STATE: AppState = {
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
 */
const APP_UTILS: AppUtils = {
  renderDataAttributes: (element: string): string => element.slice(1, -1),
  toastConfig: {
    className: 'bg-none shadow-none bg-orange-100 text-black border border-orange-200',
    duration: 3000,
    gravity: 'bottom',
    position: 'center',
  },
  showToast: (message: string): void => {
    // @ts-ignore
    Toastify({
      text: message,
      ...APP_UTILS.toastConfig,
    }).showToast();
  },
};

/**
 * Создает HTML-разметку приложения
 */
function createAppHTML(): void {
  const {
    root,
    selectors: { form, voiceSelect },
  } = APP_CONFIG;
  const { renderDataAttributes } = APP_UTILS;
  const rootElement = document.querySelector<HTMLElement>(root);

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
 * Инициализирует DOM-элементы
 */
function initDOMElements(): void {
  APP_STATE.elements = {
    form: document.querySelector<HTMLFormElement>(APP_CONFIG.selectors.form),
    formButton: document.querySelector<HTMLButtonElement>(`${APP_CONFIG.selectors.form} button`),
    voiceSelect: document.querySelector<HTMLSelectElement>(APP_CONFIG.selectors.voiceSelect),
  };
}

/**
 * Инициализирует приложение
 */
function initApp(): void {
  createAppHTML();
  initDOMElements();
  APP_STATE.synth = window.speechSynthesis;
  getVoices();
  APP_STATE.synth?.addEventListener('voiceschanged', getVoices);
  APP_STATE.elements.form?.addEventListener('submit', handleFormSubmit);
}

/**
 * Получает доступные голоса и обновляет выпадающий список
 */
function getVoices(): void {
  if (!APP_STATE.synth) return;

  const voices = APP_STATE.synth.getVoices();
  const defaultVoice = 'Google US English';

  const options = voices.map(({ name, lang }) =>
    `<option value="${name}" ${name === defaultVoice ? 'selected' : ''}>${name} (${lang})</option>`
  ).join('');

  if (APP_STATE.elements.voiceSelect) {
    APP_STATE.elements.voiceSelect.innerHTML = options;
  }
}

/**
 * Обрабатывает отправку формы
 * @param {Event} event - Событие отправки формы
 */
function handleFormSubmit(event: Event): void {
  event.preventDefault();
  const target = event.target as HTMLFormElement;
  const text = (target.text as HTMLTextAreaElement).value.trim();

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
function tts(text: string): void {
  if (!APP_STATE.synth) return;

  const utterance = new SpeechSynthesisUtterance(text);
  const selectedVoice = APP_STATE.synth.getVoices().find(voice => voice.name === APP_STATE.elements.voiceSelect?.value);

  if (selectedVoice) {
    utterance.voice = selectedVoice;
  }

  APP_STATE.synth.speak(utterance);
}

/**
 * Обновляет состояние кнопки в зависимости от длины текста
 * @param {string} text - Введенный текст
 */
function updateButtonState(text: string): void {
  if (text.length > 80) {
    setInterval(checkSpeechStatus, 500);
    toggleSpeechState();
  } else {
    if (APP_STATE.elements.formButton) {
      APP_STATE.elements.formButton.textContent = 'Convert To Speech';
    }
  }
}

/**
 * Проверяет статус речи
 */
function checkSpeechStatus(): void {
  if (APP_STATE.synth && !APP_STATE.synth.speaking && !APP_STATE.isSpeaking) {
    APP_STATE.isSpeaking = true;
    if (APP_STATE.elements.formButton) {
      APP_STATE.elements.formButton.textContent = 'Convert To Speech';
    }
  }
}

/**
 * Переключает состояние речи (пауза/возобновление)
 */
function toggleSpeechState(): void {
  if (APP_STATE.isSpeaking) {
    if (APP_STATE.synth) {
      APP_STATE.synth.resume();
      APP_STATE.isSpeaking = false;
      if (APP_STATE.elements.formButton) {
        APP_STATE.elements.formButton.textContent = 'Pause Speech';
      }
    }
  } else {
    if (APP_STATE.synth) {
      APP_STATE.synth.pause();
      APP_STATE.isSpeaking = true;
      if (APP_STATE.elements.formButton) {
        APP_STATE.elements.formButton.textContent = 'Resume Speech';
      }
    }
  }
}

initApp();
