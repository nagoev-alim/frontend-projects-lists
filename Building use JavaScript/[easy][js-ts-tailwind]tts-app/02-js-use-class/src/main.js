/**
 * Этот код реализует функциональность преобразования текста в речь (Text-to-Speech).
 * Он создает пользовательский интерфейс с формой ввода текста и выбором голоса,
 * использует Web Speech API для синтеза речи и управляет состоянием приложения.
 * Код организован в виде класса TTS, который инкапсулирует всю логику приложения.
 */

import './style.css';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';

/**
 * Класс TTS (Text-to-Speech)
 * Управляет всей функциональностью преобразования текста в речь
 */
class TTS {
  /**
   * Создает экземпляр класса TTS
   */
  constructor() {
    /**
     * Конфигурация приложения
     * @type {Object}
     */
    this.config = {
      root: '#app',
      selectors: {
        form: '[data-tts-form]',
        voiceSelect: '[data-tts-voice-select]',
      },
    };

    /**
     * Состояние приложения
     * @type {Object}
     */
    this.state = {
      elements: {
        form: null,
        voiceSelect: null,
      },
      synth: null,
      isSpeaking: true,
    };

    /**
     * Утилиты приложения
     * @type {Object}
     */
    this.utils = {
      /**
       * Преобразует селектор в data-атрибут
       * @param {string} element - Селектор элемента
       * @returns {string} Data-атрибут
       */
      renderDataAttributes: (element) => element.slice(1, -1),

      /**
       * Конфигурация для уведомлений
       * @type {Object}
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
          ...this.utils.toastConfig,
        }).showToast();
      },
    };

    this.init();
  }

  /**
   * Создает HTML-разметку приложения
   */
  createAppHTML() {
    const {
      root,
      selectors: { form, voiceSelect },
    } = this.config;
    const { renderDataAttributes } = this.utils;
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
  initDOMElements() {
    this.state.elements = {
      form: document.querySelector(this.config.selectors.form),
      formButton: document.querySelector(`${this.config.selectors.form} button`),
      voiceSelect: document.querySelector(this.config.selectors.voiceSelect),
    };
  }

  /**
   * Инициализирует приложение
   */
  init() {
    this.createAppHTML();
    this.initDOMElements();
    this.state.synth = speechSynthesis;
    this.getVoices();
    this.state.synth?.addEventListener('voiceschanged', this.getVoices.bind(this));
    this.state.elements.form.addEventListener('submit', this.handleFormSubmit.bind(this));
  }

  /**
   * Получает доступные голоса и обновляет выпадающий список
   */
  getVoices() {
    if (!this.state.synth) return;

    const voices = this.state.synth.getVoices();
    const defaultVoice = 'Google US English';

    this.state.elements.voiceSelect.innerHTML = voices.map(({ name, lang }) =>
      `<option value="${name}" ${name === defaultVoice ? 'selected' : ''}>${name} (${lang})</option>`,
    ).join('');
  }

  /**
   * Обрабатывает отправку формы
   * @param {Event} event - Событие отправки формы
   */
  handleFormSubmit(event) {
    event.preventDefault();
    const text = event.target.text.value.trim();

    if (!text) {
      this.utils.showToast('Please enter or paste something');
      return;
    }

    if (this.state.synth && !this.state.synth.speaking) {
      this.tts(text);
    }

    this.updateButtonState(text);
  }

  /**
   * Преобразует текст в речь
   * @param {string} text - Текст для преобразования
   */
  tts(text) {
    if (!this.state.synth) return;

    const utterance = new SpeechSynthesisUtterance(text);
    const selectedVoice = this.state.synth.getVoices().find(voice => voice.name === this.state.elements.voiceSelect.value);

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    this.state.synth.speak(utterance);
  }

  /**
   * Обновляет состояние кнопки в зависимости от длины текста
   * @param {string} text - Введенный текст
   */
  updateButtonState(text) {
    if (text.length > 80) {
      setInterval(this.checkSpeechStatus.bind(this), 500);
      this.toggleSpeechState();
    } else {
      this.state.elements.formButton.textContent = 'Convert To Speech';
    }
  }

  /**
   * Проверяет статус речи и обновляет состояние
   */
  checkSpeechStatus() {
    if (this.state.synth && !this.state.synth.speaking && !this.state.isSpeaking) {
      this.state.isSpeaking = true;
      this.state.elements.formButton.textContent = 'Convert To Speech';
    }
  }

  /**
   * Переключает состояние речи (пауза/возобновление)
   */
  toggleSpeechState() {
    if (this.state.isSpeaking) {
      if (this.state.synth) {
        this.state.synth.resume();
        this.state.isSpeaking = false;
        this.state.elements.formButton.textContent = 'Pause Speech';
      }
    } else {
      if (this.state.synth) {
        this.state.synth.pause();
        this.state.isSpeaking = true;
        this.state.elements.formButton.textContent = 'Resume Speech';
      }
    }
  }
}

new TTS();
