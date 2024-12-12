/**
 * Аудиоплеер с плейлистом
 * 
 * Этот модуль реализует функциональность аудиоплеера с возможностью управления плейлистом.
 * Он включает в себя воспроизведение/паузу, переключение треков, отображение информации о текущем треке,
 * управление прогрессом воспроизведения и различные режимы повтора.
 */

import './style.css';
import musicTracks from './mock';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import { icons } from 'feather-icons';

/**
 * Конфигурация приложения
 * @interface
 */
interface AppConfig {
  /** Селектор корневого элемента */
  root: string;
  /** Объект с селекторами DOM-элементов */
  selectors: {
    [key: string]: string;
  };
  /** Объект с типами повтора и их настройками */
  REPEAT_TYPES: {
    [key: string]: {
      icon: string;
      title: string;
      next: string;
    };
  };
}

/**
 * Конфигурация приложения, содержащая селекторы и типы повтора
 * @constant
 */
const APP_CONFIG: AppConfig = {
  root: '#app',
  selectors: {
    audioCover: '[data-audio-cover]',
    audioTrack: '[data-audio-track]',
    closePlaylist: '[data-close-playlist]',
    currentTime: '[data-current-time]',
    duration: '[data-duration]',
    nextTrack: '[data-next-track]',
    playPause: '[data-play-pause]',
    playlist: '[data-playlist]',
    prevTrack: '[data-prev-track]',
    progressBar: '[data-progress-bar]',
    repeatTrack: '[data-repeat-track]',
    showPlaylist: '[data-show-playlist]',
    trackArtist: '[data-track-artist]',
    trackList: '[data-track-list]',
    trackName: '[data-track-name]',
    playerContainer: '[data-player-container]',
  },
  REPEAT_TYPES: {
    repeat: {
      icon: icons['rotate-cw'].toSvg(),
      title: 'Song looped',
      next: 'repeat_one',
    },
    repeat_one: {
      icon: icons.shuffle.toSvg(),
      title: 'Playback shuffled',
      next: 'shuffle',
    },
    shuffle: {
      icon: icons.repeat.toSvg(),
      title: 'Playlist looped',
      next: 'repeat',
    },
  },
};

/**
 * Состояние приложения
 * @interface
 */
interface AppState {
  /** Объект с DOM-элементами */
  elements: {
    [key: string]: HTMLElement | HTMLImageElement | HTMLAudioElement | HTMLSpanElement | HTMLButtonElement | HTMLDivElement | HTMLParagraphElement | HTMLUListElement | null;
  };
  /** Индекс текущего трека */
  musicIndex: number;
}

/**
 * Состояние приложения, содержащее элементы DOM и индекс текущего трека
 * @constant
 */
const APP_STATE: AppState = {
  elements: {
    audioCover: null,
    audioTrack: null,
    closePlaylist: null,
    currentTime: null,
    duration: null,
    nextTrack: null,
    playPause: null,
    playlist: null,
    prevTrack: null,
    progressBar: null,
    repeatTrack: null,
    showPlaylist: null,
    trackArtist: null,
    trackList: null,
    trackName: null,
    playerContainer: null,
  },
  musicIndex: Math.floor(Math.random() * musicTracks.length + 1),
};

/**
 * Утилиты приложения
 * @interface
 */
interface AppUtils {
  /** Добавляет ведущий ноль к числу */
  addLeadingZero: (num: number) => string;
  /** Удаляет квадратные скобки из строки с data-атрибутом */
  renderDataAttributes: (element: string) => string;
  /** Конфигурация для уведомлений Toastify */
  toastConfig: Toastify.Options;
  /** Показывает уведомление */
  showToast: (message: string) => void;
  /** Обрабатывает ошибки */
  handleError: (message: string, error?: Error | null) => void;
}

/**
 * Утилиты приложения, содержащие вспомогательные функции и конфигурации
 * @constant
 */
const APP_UTILS: AppUtils = {
  /**
   * Добавляет ведущий ноль к числу, если оно меньше 10
   * @param {number} num - Число для форматирования
   * @returns {string} Отформатированная строка
   */
  addLeadingZero: (num: number): string => num.toString().padStart(2, '0'),

  /**
   * Удаляет квадратные скобки из строки с data-атрибутом
   * @param {string} element - Строка с data-атрибутом
   * @returns {string} Строка без квадратных скобок
   */
  renderDataAttributes: (element: string): string => element.slice(1, -1),

  /**
   * Конфигурация для уведомлений Toastify
   */
  toastConfig: {
    className: 'bg-none shadow-none bg-orange-100 text-black border border-orange-200',
    duration: 3000,
    gravity: 'bottom',
    position: 'center',
  },

  /**
   * Показывает уведомление с помощью Toastify
   * @param {string} message - Текст уведомления
   */
  showToast: (message: string): void => {
    Toastify({
      text: message,
      ...APP_UTILS.toastConfig,
    }).showToast();
  },

  /**
   * Обрабатывает ошибки, показывая уведомление и логируя в консоль
   * @param {string} message - Сообщение об ошибке
   * @param {Error | null} [error] - Объект ошибки (опционально)
   */
  handleError: (message: string, error: Error | null = null): void => {
    APP_UTILS.showToast(message);
    if (error) console.error(message, error);
  },
};

/**
 * Создает HTML-разметку для приложения.
 */
function createAppHTML(): void {
  const {
    root,
    selectors: {
      audioCover,
      audioTrack,
      closePlaylist,
      currentTime,
      duration,
      nextTrack,
      playPause,
      playlist,
      prevTrack,
      progressBar,
      repeatTrack,
      showPlaylist,
      trackArtist,
      trackList,
      trackName,
      playerContainer,
    },
  } = APP_CONFIG;
  const { renderDataAttributes } = APP_UTILS;
  const rootElement = document.querySelector(root);

  if (!rootElement) return;

  rootElement.innerHTML = `
      <div class='player overflow-hidden' ${renderDataAttributes(playerContainer)}>
        <h1 class='font-bold md:text-4xl text-2xl text-center'></h1>
        <div class='top-line'>
          ${icons['chevron-down'].toSvg()}
          <span class='h6'>Now Playing</span>
          ${icons['more-horizontal'].toSvg()}
        </div>
  
        <div class='cover'>
          <img ${renderDataAttributes(audioCover)} src='#' alt='Cover'>
        </div>
  
        <div class='details'>
          <p class='h5' ${renderDataAttributes(trackName)}></p>
          <p ${renderDataAttributes(trackArtist)}></p>
        </div>
  
        <div class='progress' ${renderDataAttributes(progressBar)}>
          <div class='progress__bar'>
            <audio ${renderDataAttributes(audioTrack)} src></audio>
          </div>
          <div class='timer'>
            <span ${renderDataAttributes(currentTime)}>0:00</span>
            <span ${renderDataAttributes(duration)}>0:00</span>
          </div>
        </div>
  
        <div class='controls flex justify-between'>
          <button ${renderDataAttributes(repeatTrack)}="repeat" title='Playlist looped'>${icons.repeat.toSvg()}</button>
          <button ${renderDataAttributes(prevTrack)}>${icons['skip-back'].toSvg()}</button>
          <button ${renderDataAttributes(playPause)}>${icons.play.toSvg()}</button>
          <button ${renderDataAttributes(nextTrack)}>${icons['skip-forward'].toSvg()}</button>
          <button ${renderDataAttributes(showPlaylist)}>${icons.list.toSvg()}</button>
        </div>
  
        <div class='list' ${renderDataAttributes(playlist)}>
          <div class='header'>
            ${icons.music.toSvg()}
            <span>Music list</span>
            <button ${renderDataAttributes(closePlaylist)}>${icons.x.toSvg()}</button>
          </div>
          <ul ${renderDataAttributes(trackList)}></ul>
        </div>
      </div>
    `;
}

/**
 * Инициализирует DOM-элементы приложения.
 * @returns {void}
 */
function initDOMElements(): void {
  APP_STATE.elements = {
    audioCover: document.querySelector<HTMLImageElement>(APP_CONFIG.selectors.audioCover)!,
    audioTrack: document.querySelector<HTMLAudioElement>(APP_CONFIG.selectors.audioTrack)!,
    closePlaylist: document.querySelector<HTMLButtonElement>(APP_CONFIG.selectors.closePlaylist)!,
    currentTime: document.querySelector<HTMLSpanElement>(APP_CONFIG.selectors.currentTime)!,
    duration: document.querySelector<HTMLSpanElement>(APP_CONFIG.selectors.duration)!,
    nextTrack: document.querySelector<HTMLButtonElement>(APP_CONFIG.selectors.nextTrack)!,
    playPause: document.querySelector<HTMLButtonElement>(APP_CONFIG.selectors.playPause)!,
    playlist: document.querySelector<HTMLDivElement>(APP_CONFIG.selectors.playlist)!,
    prevTrack: document.querySelector<HTMLButtonElement>(APP_CONFIG.selectors.prevTrack)!,
    progressBar: document.querySelector<HTMLDivElement>(APP_CONFIG.selectors.progressBar)!,
    repeatTrack: document.querySelector<HTMLButtonElement>(APP_CONFIG.selectors.repeatTrack)!,
    showPlaylist: document.querySelector<HTMLButtonElement>(APP_CONFIG.selectors.showPlaylist)!,
    trackArtist: document.querySelector<HTMLParagraphElement>(APP_CONFIG.selectors.trackArtist)!,
    trackList: document.querySelector<HTMLUListElement>(APP_CONFIG.selectors.trackList)!,
    trackName: document.querySelector<HTMLParagraphElement>(APP_CONFIG.selectors.trackName)!,
    playerContainer: document.querySelector<HTMLDivElement>(APP_CONFIG.selectors.playerContainer)!,
  };
}

/**
 * Инициализирует приложение.
 * @returns {void}
 */
function initApp(): void {
  createAppHTML();
  initDOMElements();
  window.addEventListener('load', () => {
    populateMusicList();
    updateCurrentTrackInfo(APP_STATE.musicIndex);
    updatePlayingTrackVisuals();
  });
  APP_STATE.elements.playPause?.addEventListener('click', handlePlayPauseClick);
  APP_STATE.elements.nextTrack?.addEventListener('click', () => handleTrackChange('next'));
  APP_STATE.elements.prevTrack?.addEventListener('click', () => handleTrackChange('prev'));
  APP_STATE.elements.repeatTrack?.addEventListener('click', handleRepeatTrackClick);
  [APP_STATE.elements.showPlaylist, APP_STATE.elements.closePlaylist].forEach((button) => button?.addEventListener('click', () => APP_STATE.elements.playlist?.classList.toggle('open')));
  APP_STATE.elements.progressBar?.addEventListener('click', handleProgressBarClick);
  APP_STATE.elements.audioTrack?.addEventListener('timeupdate', handleAudioTrackTimeUpdate);
  APP_STATE.elements.audioTrack?.addEventListener('loadeddata', handleAudioTrackLoaded);
  APP_STATE.elements.audioTrack?.addEventListener('ended', handleAudioTrackEnd);
}

/**
 * Заполняет список музыкальных треков.
 * @returns {void}
 */
function populateMusicList(): void {
  musicTracks.forEach((track, index) => {
    const li = createTrackListItem(track, index);
    APP_STATE.elements.trackList?.append(li);
    setupTrackDuration(li);
  });
}

/**
 * Интерфейс, описывающий структуру объекта музыкального трека
 */
interface MusicTrack {
  /** Название трека */
  name: string;
  /** Имя исполнителя */
  artist: string;
  /** URL изображения обложки */
  img: string;
  /** URL аудиофайла */
  src: string;
}

/**
 * Создает элемент списка для музыкального трека.
 * @param {MusicTrack} track - Объект с информацией о треке.
 * @param {number} index - Индекс трека в списке.
 * @returns {HTMLLIElement} Созданный элемент списка.
 */
function createTrackListItem({ name, artist, src }: MusicTrack, index: number): HTMLLIElement {
  const li = document.createElement('li');
  li.dataset.index = (index + 1).toString();
  li.innerHTML = `
    <div>
      <p class='h6'>${name}</p>
      <p>${artist}</p>
    </div>
    <span data-duration='${src}' data-total-duration>0:00</span>
    <audio data-song='${src}' class='visually-hidden' src='${src}'></audio>
  `;
  return li;
}

/**
 * Устанавливает обработчик для загрузки длительности трека.
 * @param {HTMLLIElement} li - Элемент списка трека.
 * @returns {void}
 */
function setupTrackDuration(li: HTMLLIElement): void {
  const duration = li.querySelector<HTMLSpanElement>('[data-duration]')!;
  const song = li.querySelector<HTMLAudioElement>('[data-song]')!;
  song.addEventListener('loadeddata', () =>
    updateDuration(duration, song.duration),
  );
}

/**
 * Обновляет отображение длительности трека.
 * @param {HTMLSpanElement} element - Элемент для отображения длительности.
 * @param {number} time - Длительность трека в секундах.
 * @returns {void}
 */
function updateDuration(element: HTMLSpanElement, time: number): void {
  const formattedTime = formatTime(time);
  element.textContent = formattedTime;
  element.dataset.totalDuration = formattedTime;
}

/**
 * Форматирует время в минуты:секунды.
 * @param {number} time - Время в секундах.
 * @returns {string} Отформатированное время.
 */
function formatTime(time: number): string {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${APP_UTILS.addLeadingZero(seconds)}`;
}

/**
 * Обновляет информацию о текущем треке.
 * @param {number} index - Индекс текущего трека.
 * @returns {void}
 */
function updateCurrentTrackInfo(index: number): void {
  const { name, artist, img, src } = musicTracks[index - 1];
  if (!APP_STATE.elements.audioTrack || !APP_STATE.elements.audioCover || !APP_STATE.elements.trackArtist || !APP_STATE.elements.trackName) return;
  APP_STATE.elements.trackName.textContent = name;
  APP_STATE.elements.trackArtist.textContent = artist;
  if (APP_STATE.elements.audioCover instanceof HTMLImageElement) {
    APP_STATE.elements.audioCover.src = img;
  }
  if (APP_STATE.elements.audioTrack instanceof HTMLAudioElement) {
    APP_STATE.elements.audioTrack.src = src;
  }
}

/**
 * Обновляет визуальное отображение играющего трека.
 * @returns {void}
 */
function updatePlayingTrackVisuals(): void {
  const trackListItems = Array.from(APP_STATE.elements.trackList!.querySelectorAll<HTMLLIElement>('li'));

  trackListItems.forEach((track) => {
    const trackIndex = Number(track.dataset.index);
    const isPlaying = trackIndex === APP_STATE.musicIndex;

    const trackDurationElement = track.querySelector<HTMLSpanElement>('[data-duration]')!;
    const trackTotalDuration = trackDurationElement.dataset.totalDuration!;

    track.addEventListener('click', async ({ target }) => {
      if (target instanceof HTMLElement && target.dataset.index) {
        APP_STATE.musicIndex = Number(target.dataset.index);
        updateCurrentTrackInfo(APP_STATE.musicIndex);
        await playSelectedTrack();
        updatePlayingTrackVisuals();
      }
    });

    track.classList.toggle('playing', isPlaying);
    trackDurationElement.textContent = isPlaying ? 'Playing' : trackTotalDuration;
  });
}

/**
 * Воспроизводит выбранный трек.
 * @returns {Promise<void>}
 */
async function playSelectedTrack(): Promise<void> {
  if (!APP_STATE.elements.playerContainer || !APP_STATE.elements.playPause || !APP_STATE.elements.audioTrack) {
    APP_UTILS.handleError('Required elements are not initialized.');
    return;
  }

  APP_STATE.elements.playerContainer.classList.add('paused');
  APP_STATE.elements.playPause.innerHTML = icons.pause.toSvg();

  try {
    const audioTrack = APP_STATE.elements.audioTrack as HTMLAudioElement;
    await audioTrack.pause();
    await audioTrack.play();
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        console.log('Play request was interrupted, likely due to a new track being loaded.');
      } else {
        APP_UTILS.handleError('Error occurred while playing the track.', error);
      }
    } else {
      APP_UTILS.handleError('An unknown error occurred while playing the track.');
    }
  }
}

/**
 * Обрабатывает клик по кнопке воспроизведения/паузы.
 * @returns {Promise<void>}
 */
async function handlePlayPauseClick(): Promise<void> {
  APP_STATE.elements.playerContainer!.classList.contains('paused')
    ? pauseSelectedTrack()
    : await playSelectedTrack();
  updatePlayingTrackVisuals();
}

/**
 * Ставит текущий трек на паузу.
 * @returns {void}
 */
function pauseSelectedTrack(): void {
  APP_STATE.elements.playerContainer?.classList.remove('paused');
  APP_STATE.elements.playPause!.innerHTML = icons.play.toSvg();
  APP_STATE.elements.audioTrack!.pause();
}

/**
 * Обрабатывает смену трека (следующий или предыдущий).
 * @param {'next' | 'prev'} direction - Направление смены трека.
 * @returns {Promise<void>}
 */
async function handleTrackChange(direction: 'next' | 'prev'): Promise<void> {
  const step = direction === 'next' ? 1 : -1;
  APP_STATE.musicIndex = ((APP_STATE.musicIndex - 1 + step + musicTracks.length) % musicTracks.length) + 1;
  updateCurrentTrackInfo(APP_STATE.musicIndex);
  await playSelectedTrack();
  updatePlayingTrackVisuals();
}

/**
 * Обрабатывает клик по кнопке повтора трека.
 * @param {MouseEvent} event - Событие клика.
 * @returns {void}
 */
function handleRepeatTrackClick(event: Event): void {
  const target = event.currentTarget as HTMLButtonElement;
  const repeatType = target.dataset.repeatTrack as keyof typeof APP_CONFIG.REPEAT_TYPES;
  const { icon, title, next } = APP_CONFIG.REPEAT_TYPES[repeatType];
  target.innerHTML = icon;
  target.title = title;
  target.dataset.repeatTrack = next;
}

/**
 * Обрабатывает клик по полосе прогресса для перемотки трека.
 * @param {MouseEvent} event - Событие клика.
 * @returns {Promise<void>}
 */
async function handleProgressBarClick(event: Event): Promise<void> {
  if (!(event instanceof MouseEvent)) {
    return;
  }
  const { offsetX } = event;
  const audioTrack = APP_STATE.elements.audioTrack as HTMLAudioElement | null;
  const progressBar = APP_STATE.elements.progressBar as HTMLDivElement | null;

  if (audioTrack && progressBar) {
    audioTrack.currentTime = (offsetX / progressBar.clientWidth) * audioTrack.duration;
    await playSelectedTrack();
    updatePlayingTrackVisuals();
  } else {
    APP_UTILS.handleError('Audio track or progress bar element not found.');
  }
}

/**
 * Обновляет отображение времени и прогресса воспроизведения трека.
 * @param {Event} event - Событие обновления времени аудио.
 * @returns {void}
 */
function handleAudioTrackTimeUpdate(event: Event): void {
  const { currentTime, duration } = event.target as HTMLAudioElement;
  const progressPercentage = (currentTime / duration) * 100;
  const progressBar = APP_STATE.elements.progressBar as HTMLDivElement;
  if (progressBar && progressBar.firstElementChild instanceof HTMLElement) {
    progressBar.firstElementChild.style.width = `${progressPercentage}%`;
  }
  if (APP_STATE.elements.currentTime) {
    APP_STATE.elements.currentTime.textContent = formatTime(currentTime);
  }
}

/**
 * Обрабатывает окончание воспроизведения трека.
 * @returns {Promise<void>}
 */
async function handleAudioTrackEnd(): Promise<void> {
  const repeatMode = APP_STATE.elements.repeatTrack!.dataset.repeatTrack as 'repeat' | 'repeat_one' | 'shuffle';
  const actions: Record<typeof repeatMode, () => Promise<void>> = {
    repeat: async () => await handleTrackChange('next'),
    repeat_one: async () => {
      APP_STATE.elements.audioTrack!.currentTime = 0;
      await playSelectedTrack();
    },
    shuffle: async () => {
      APP_STATE.musicIndex = getRandomTrackIndex();
      updateCurrentTrackInfo(APP_STATE.musicIndex);
      await playSelectedTrack();
      updatePlayingTrackVisuals();
    },
  };

  await actions[repeatMode]();
}

/**
 * Обработчик события 'loadeddata' для аудио-трека.
 * Устанавливает отображаемую длительность трека после его загрузки.
 *
 * @returns {void}
 */
function handleAudioTrackLoaded(): void {
  if (APP_STATE.elements.audioTrack && APP_STATE.elements.duration) {
    const duration = APP_STATE.elements.audioTrack.duration;
    APP_STATE.elements.duration.innerText = formatTime(duration);
  }
}

/**
 * Возвращает случайный индекс трека, отличный от текущего.
 * @returns {number} Новый случайный индекс трека.
 */
function getRandomTrackIndex(): number {
  let newIndex: number;
  do {
    newIndex = Math.floor(Math.random() * musicTracks.length + 1);
  } while (newIndex === APP_STATE.musicIndex);
  return newIndex;
}

initApp();
