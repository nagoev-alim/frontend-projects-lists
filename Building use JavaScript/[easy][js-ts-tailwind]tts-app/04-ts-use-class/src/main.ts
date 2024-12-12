/**
 * Этот код реализует функциональность преобразования текста в речь (Text-to-Speech).
 * Он позволяет пользователю ввести текст, выбрать голос и преобразовать текст в речь.
 * Класс TTS управляет всем процессом, включая создание пользовательского интерфейса,
 * обработку пользовательского ввода и взаимодействие с API синтеза речи.
 */

import './style.css';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';

/**
 * Интерфейс для конфигурации приложения.
 */
interface Config {
  /** Корневой элемент приложения */
  root: string;
  /** Селекторы для элементов формы */
  selectors: {
    /** Селектор формы */
    form: string;
    /** Селектор выбора голоса */
    voiceSelect: string;
  };
}

/**
 * Интерфейс для состояния приложения.
 */
interface State {
  /** Элементы DOM */
  elements: {
    /** Элемент формы */
    form: HTMLFormElement | null;
    /** Элемент выбора голоса */
    voiceSelect: HTMLSelectElement | null;
    /** Кнопка формы */
    formButton: HTMLButtonElement | null;
  };
  /** Объект синтеза речи */
  synth: SpeechSynthesis | null;
  /** Флаг, указывающий, говорит ли синтезатор в данный момент */
  isSpeaking: boolean;
}

/**
 * Интерфейс для утилит приложения.
 */
interface Utils {
  /** Функция для рендеринга data-атрибутов */
  renderDataAttributes: (element: string) => string;
  /** Конфигурация для уведомлений */
  toastConfig: {
    className: string;
    duration: number;
    gravity: string;
    position: string;
  };
  /** Функция для отображения уведомления */
  showToast: (message: string) => void;
}

/**
 * Класс, реализующий функциональность Text-to-Speech.
 */
class TTS {
  /** Конфигурация приложения */
  private readonly config: Config;
  /** Состояние приложения */
  private state: State;
  /** Утилиты приложения */
  private readonly utils: Utils;

  /**
   * Конструктор класса TTS.
   * Инициализирует конфигурацию, состояние и утилиты, затем вызывает метод init.
   */
  constructor() {
    this.config = {
      root: '#app',
      selectors: {
        form: '[data-tts-form]',
        voiceSelect: '[data-tts-voice-select]',
      },
    };

    this.state = {
      elements: {
        form: null,
        voiceSelect: null,
        formButton: null,
      },
      synth: null,
      isSpeaking: true,
    };

    this.utils = {
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
          ...this.utils.toastConfig,
        }).showToast();
      },
    };

    this.init();
  }

  /**
   * Создает HTML-разметку приложения.
   */
  private createAppHTML(): void {
    const {
      root,
      selectors: { form, voiceSelect },
    } = this.config;
    const { renderDataAttributes } = this.utils;
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
   * Инициализирует элементы DOM.
   */
  private initDOMElements(): void {
    this.state.elements = {
      form: document.querySelector<HTMLFormElement>(this.config.selectors.form),
      formButton: document.querySelector<HTMLButtonElement>(`${this.config.selectors.form} button`),
      voiceSelect: document.querySelector<HTMLSelectElement>(this.config.selectors.voiceSelect),
    };
  }

  /**
   * Инициализирует приложение.
   */
  private init(): void {
    this.createAppHTML();
    this.initDOMElements();
    this.state.synth = window.speechSynthesis;
    this.getVoices();
    this.state.synth?.addEventListener('voiceschanged', this.getVoices.bind(this));
    this.state.elements.form?.addEventListener('submit', this.handleFormSubmit.bind(this));
  }

  /**
   * Получает доступные голоса и заполняет селект.
   */
  private getVoices(): void {
    if (!this.state.synth) return;

    const voices = this.state.synth.getVoices();
    const defaultVoice = 'Google US English';

    if (this.state.elements.voiceSelect) {
      this.state.elements.voiceSelect.innerHTML = voices.map(({ name, lang }) =>
        `<option value="${name}" ${name === defaultVoice ? 'selected' : ''}>${name} (${lang})</option>`
      ).join('');
    }
  }

  /**
   * Обрабатывает отправку формы.
   * @param event - Событие отправки формы
   */
  private handleFormSubmit(event: Event): void {
    event.preventDefault();
    const target = event.target as HTMLFormElement;
    const text = (target.text as HTMLTextAreaElement).value.trim();

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
   * Преобразует текст в речь.
   * @param text - Текст для преобразования
   */
  private tts(text: string): void {
    if (!this.state.synth) return;

    const utterance = new SpeechSynthesisUtterance(text);
    const selectedVoice = this.state.synth.getVoices().find(voice => voice.name === this.state.elements.voiceSelect?.value);

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    this.state.synth.speak(utterance);
  }

  /**
   * Обновляет состояние кнопки в зависимости от длины текста.
   * @param text - Введенный текст
   */
  private updateButtonState(text: string): void {
    if (text.length > 80) {
      setInterval(this.checkSpeechStatus.bind(this), 500);
      this.toggleSpeechState();
    } else {
      if (this.state.elements.formButton) {
        this.state.elements.formButton.textContent = 'Convert To Speech';
      }
    }
  }

  /**
   * Проверяет статус речи и обновляет состояние кнопки.
   */
  private checkSpeechStatus(): void {
    if (this.state.synth && !this.state.synth.speaking && !this.state.isSpeaking) {
      this.state.isSpeaking = true;
      if (this.state.elements.formButton) {
        this.state.elements.formButton.textContent = 'Convert To Speech';
      }
    }
  }

  /**
   * Переключает состояние речи между воспроизведением и паузой.
   */
  private toggleSpeechState(): void {
    if (this.state.isSpeaking) {
      if (this.state.synth) {
        this.state.synth.resume();
        this.state.isSpeaking = false;
        if (this.state.elements.formButton) {
          this.state.elements.formButton.textContent = 'Pause Speech';
        }
      }
    } else {
      if (this.state.synth) {
        this.state.synth.pause();
        this.state.isSpeaking = true;
        if (this.state.elements.formButton) {
          this.state.elements.formButton.textContent = 'Resume Speech';
        }
      }
    }
  }
}

new TTS();
