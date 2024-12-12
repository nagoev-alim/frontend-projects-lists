/**
 * @fileoverview Этот файл содержит реализацию музыкального плеера.
 * Плеер поддерживает воспроизведение, паузу, переключение треков,
 * отображение списка треков и различные режимы повтора.
 */

import './style.css';
import musicTracks from './mock';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import { icons } from 'feather-icons';

/**
 * @interface AppConfig
 * @description Интерфейс для конфигурации приложения
 */
interface AppConfig {
  /** Корневой элемент для рендеринга плеера */
  root: string;
  /** Селекторы для различных элементов плеера */
  selectors: {
    [key: string]: string;
  };
  /** Типы повтора и их конфигурации */
  REPEAT_TYPES: {
    [key: string]: {
      icon: string;
      title: string;
      next: string;
    };
  };
}

/**
 * @interface AppState
 * @description Интерфейс для состояния приложения
 */
interface AppState {
  /** Ссылки на DOM элементы */
  elements: {
    [key: string]: HTMLElement | HTMLImageElement | HTMLAudioElement | HTMLSpanElement | HTMLButtonElement | HTMLDivElement | HTMLParagraphElement | HTMLUListElement | null;
  };
  /** Индекс текущего трека */
  musicIndex: number;
}

/**
 * @interface AppUtils
 * @description Интерфейс для утилитарных функций приложения
 */
interface AppUtils {
  /** Добавляет ведущий ноль к числу */
  addLeadingZero: (num: number) => string;
  /** Рендерит data-атрибуты */
  renderDataAttributes: (element: string) => string;
  /** Конфигурация для toast-уведомлений */
  toastConfig: Toastify.Options;
  /** Показывает toast-уведомление */
  showToast: (message: string) => void;
  /** Обрабатывает ошибки */
  handleError: (message: string, error?: Error | null) => void;
}

/**
 * @interface MusicTrack
 * @description Интерфейс для музыкального трека
 */
interface MusicTrack {
  /** Название трека */
  name: string;
  /** Исполнитель */
  artist: string;
  /** URL обложки */
  img: string;
  /** URL аудиофайла */
  src: string;
}

/**
 * @class MusicPlayer
 * @description Основной класс музыкального плеера
 */
class MusicPlayer {
  private readonly config: AppConfig;
  private readonly state: AppState;
  private readonly utils: AppUtils;

  /**
   * @constructor
   * @description Инициализирует музыкальный плеер
   */
  constructor() {
    this.config = {
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

    this.state = {
      elements: {},
      musicIndex: Math.floor(Math.random() * musicTracks.length + 1),
    };

    this.utils = {
      addLeadingZero: (num) => num.toString().padStart(2, '0'),
      renderDataAttributes: (element) => element.slice(1, -1),
      toastConfig: {
        className: 'bg-none shadow-none bg-orange-100 text-black border border-orange-200',
        duration: 3000,
        gravity: 'bottom',
        position: 'center',
      },
      showToast: (message) => {
        Toastify({
          text: message,
          ...this.utils.toastConfig,
        }).showToast();
      },
      handleError: (message, error = null) => {
        this.utils.showToast(message);
        if (error) console.error(message, error);
      },
    };

    this.init();
  }

  /**
   * @private
   * @method createAppHTML
   * @description Создает HTML-структуру плеера
   */
  private createAppHTML(): void {
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
    } = this.config;
    const { renderDataAttributes } = this.utils;
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
   * @private
   * @method initDOMElements
   * @description Инициализирует ссылки на DOM-элементы
   */
  private initDOMElements(): void {
    this.state.elements = {
      audioCover: document.querySelector<HTMLImageElement>(this.config.selectors.audioCover)!,
      audioTrack: document.querySelector<HTMLAudioElement>(this.config.selectors.audioTrack)!,
      closePlaylist: document.querySelector<HTMLButtonElement>(this.config.selectors.closePlaylist)!,
      currentTime: document.querySelector<HTMLSpanElement>(this.config.selectors.currentTime)!,
      duration: document.querySelector<HTMLSpanElement>(this.config.selectors.duration)!,
      nextTrack: document.querySelector<HTMLButtonElement>(this.config.selectors.nextTrack)!,
      playPause: document.querySelector<HTMLButtonElement>(this.config.selectors.playPause)!,
      playlist: document.querySelector<HTMLDivElement>(this.config.selectors.playlist)!,
      prevTrack: document.querySelector<HTMLButtonElement>(this.config.selectors.prevTrack)!,
      progressBar: document.querySelector<HTMLDivElement>(this.config.selectors.progressBar)!,
      repeatTrack: document.querySelector<HTMLButtonElement>(this.config.selectors.repeatTrack)!,
      showPlaylist: document.querySelector<HTMLButtonElement>(this.config.selectors.showPlaylist)!,
      trackArtist: document.querySelector<HTMLParagraphElement>(this.config.selectors.trackArtist)!,
      trackList: document.querySelector<HTMLUListElement>(this.config.selectors.trackList)!,
      trackName: document.querySelector<HTMLParagraphElement>(this.config.selectors.trackName)!,
      playerContainer: document.querySelector<HTMLDivElement>(this.config.selectors.playerContainer)!,
    };
  }

  /**
   * @private
   * @method init
   * @description Инициализирует плеер и устанавливает обработчики событий
   */
  private init(): void {
    this.createAppHTML();
    this.initDOMElements();
    window.addEventListener('load', () => {
      this.populateMusicList();
      this.updateCurrentTrackInfo(this.state.musicIndex);
      this.updatePlayingTrackVisuals();
    });
    this.state.elements.playPause?.addEventListener('click', this.handlePlayPauseClick);
    this.state.elements.nextTrack?.addEventListener('click', () => this.handleTrackChange('next'));
    this.state.elements.prevTrack?.addEventListener('click', () => this.handleTrackChange('prev'));
    this.state.elements.repeatTrack?.addEventListener('click', this.handleRepeatTrackClick);
    [this.state.elements.showPlaylist, this.state.elements.closePlaylist].forEach((button) => button?.addEventListener('click', () => this.state.elements.playlist?.classList.toggle('open')));
    this.state.elements.progressBar?.addEventListener('click', this.handleProgressBarClick);
    this.state.elements.audioTrack?.addEventListener('timeupdate', this.handleAudioTrackTimeUpdate);
    this.state.elements.audioTrack?.addEventListener('loadeddata', this.handleAudioTrackLoaded);
    this.state.elements.audioTrack?.addEventListener('ended', this.handleAudioTrackEnd);
  }

  /**
   * Заполняет список музыкальных треков.
   * Создает элементы списка для каждого трека и добавляет их в DOM.
   * @private
   */
  private populateMusicList(): void {
    musicTracks.forEach((track, index) => {
      const li = this.createTrackListItem(track, index);
      this.state.elements.trackList?.append(li);
      this.setupTrackDuration(li);
    });
  }

  /**
   * Создает элемент списка для отдельного музыкального трека.
   * @param {MusicTrack} param0 - Объект с данными музыкального трека.
   * @param {number} index - Индекс трека в списке.
   * @returns {HTMLLIElement} Созданный элемент списка.
   * @private
   */
  private createTrackListItem({ name, artist, src }: MusicTrack, index: number): HTMLLIElement {
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
   * Устанавливает обработчик события для загрузки длительности трека.
   * @param {HTMLLIElement} li - Элемент списка для трека.
   * @private
   */
  private setupTrackDuration(li: HTMLLIElement): void {
    const duration = li.querySelector<HTMLSpanElement>('[data-duration]')!;
    const song = li.querySelector<HTMLAudioElement>('[data-song]')!;
    song.addEventListener('loadeddata', () => this.updateDuration(duration, song.duration));
  }

  /**
   * Обновляет отображение длительности трека.
   * @param {HTMLSpanElement} element - Элемент для отображения длительности.
   * @param {number} time - Длительность трека в секундах.
   * @private
   */
  private updateDuration(element: HTMLSpanElement, time: number): void {
    const formattedTime = this.formatTime(time);
    element.textContent = formattedTime;
    element.dataset.totalDuration = formattedTime;
  }

  /**
   * Форматирует время из секунд в строку вида "минуты:секунды".
   * @param {number} time - Время в секундах.
   * @returns {string} Отформатированное время.
   * @private
   */
  private formatTime(time: number): string {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${this.utils.addLeadingZero(seconds)}`;
  }

  /**
   * Обновляет информацию о текущем треке.
   * @param {number} index - Индекс текущего трека.
   * @private
   */
  private updateCurrentTrackInfo(index: number): void {
    const { name, artist, img, src } = musicTracks[index - 1];
    const { audioTrack, audioCover, trackArtist, trackName } = this.state.elements;

    if (!audioTrack || !audioCover || !trackArtist || !trackName) return;

    trackName.textContent = name;
    trackArtist.textContent = artist;

    if (audioCover instanceof HTMLImageElement) {
      audioCover.src = img;
    }

    if (audioTrack instanceof HTMLAudioElement) {
      audioTrack.src = src;
    }
  }

  /**
   * Обновляет визуальное отображение текущего играющего трека в списке.
   * @private
   */
  private updatePlayingTrackVisuals(): void {
    const trackListItems = Array.from(this.state.elements.trackList!.querySelectorAll<HTMLLIElement>('li'));

    trackListItems.forEach((track) => {
      const trackIndex = Number(track.dataset.index);
      const isPlaying = trackIndex === this.state.musicIndex;

      const trackDurationElement = track.querySelector<HTMLSpanElement>('[data-duration]')!;
      const trackTotalDuration = trackDurationElement.dataset.totalDuration!;

      track.addEventListener('click', async ({ target }) => {
        if (target instanceof HTMLElement && target.dataset.index) {
          this.state.musicIndex = Number(target.dataset.index);
          this.updateCurrentTrackInfo(this.state.musicIndex);
          await this.playSelectedTrack();
          this.updatePlayingTrackVisuals();
        }
      });

      track.classList.toggle('playing', isPlaying);
      trackDurationElement.textContent = isPlaying ? 'Playing' : trackTotalDuration;
    });
  }

  /**
   * Воспроизводит выбранный трек.
   * @returns {Promise<void>}
   * @private
   */
  private async playSelectedTrack(): Promise<void> {
    const { playerContainer, playPause, audioTrack } = this.state.elements;

    if (!playerContainer || !playPause || !audioTrack) {
      this.utils.handleError('Required elements are not initialized.');
      return;
    }

    playerContainer.classList.add('paused');
    playPause.innerHTML = icons.pause.toSvg();

    try {
      const audio = audioTrack as HTMLAudioElement;
      await audio.pause();
      await audio.play();
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          console.log('Play request was interrupted, likely due to a new track being loaded.');
        } else {
          this.utils.handleError('Error occurred while playing the track.', error);
        }
      } else {
        this.utils.handleError('An unknown error occurred while playing the track.');
      }
    }
  }

  /**
   * Обработчик клика по кнопке воспроизведения/паузы.
   * @returns {Promise<void>}
   * @private
   */
  private handlePlayPauseClick = async (): Promise<void> => {
    const { playerContainer } = this.state.elements;

    if (playerContainer) {
      if (playerContainer.classList.contains('paused')) {
        this.pauseSelectedTrack();
      } else {
        await this.playSelectedTrack();
      }
      this.updatePlayingTrackVisuals();
    } else {
      this.utils.handleError('Player container element not found.');
    }
  };

  /**
   * Ставит на паузу текущий трек.
   * @private
   */
  private pauseSelectedTrack(): void {
    const { playerContainer, playPause, audioTrack } = this.state.elements;

    if (playerContainer instanceof HTMLElement) {
      playerContainer.classList.remove('paused');
    }
    if (playPause instanceof HTMLElement) {
      playPause.innerHTML = icons.play.toSvg();
    }
    if (audioTrack instanceof HTMLAudioElement) {
      audioTrack.pause();
    }
  }

  /**
   * Обработчик смены трека (следующий или предыдущий).
   * @param {('next'|'prev')} direction - Направление смены трека.
   * @returns {Promise<void>}
   * @private
   */
  private async handleTrackChange(direction: 'next' | 'prev'): Promise<void> {
    const step = direction === 'next' ? 1 : -1;
    this.state.musicIndex = ((this.state.musicIndex - 1 + step + musicTracks.length) % musicTracks.length) + 1;
    this.updateCurrentTrackInfo(this.state.musicIndex);
    await this.playSelectedTrack();
    this.updatePlayingTrackVisuals();
  }

  /**
   * Обработчик клика по кнопке повтора трека.
   * @param {Event} event - Объект события.
   * @private
   */
  private handleRepeatTrackClick = (event: Event): void => {
    const target = event.currentTarget as HTMLButtonElement;
    const repeatType = target.dataset.repeatTrack as keyof typeof this.config.REPEAT_TYPES;
    const { icon, title, next } = this.config.REPEAT_TYPES[repeatType];
    target.innerHTML = icon;
    target.title = title;
    target.dataset.repeatTrack = next;
  };

  /**
   * Обработчик клика по прогресс-бару аудио.
   * Устанавливает текущее время воспроизведения трека в соответствии с местом клика.
   * @param {Event} event - Событие клика.
   * @returns {Promise<void>}
   * @private
   */
  private handleProgressBarClick = async (event: Event): Promise<void> => {
    if (!(event instanceof MouseEvent)) return;

    const { offsetX } = event;
    const audioTrack = this.state.elements?.audioTrack as HTMLAudioElement | null;
    const progressBar = this.state.elements?.progressBar as HTMLDivElement | null;

    if (audioTrack && progressBar) {
      audioTrack.currentTime = (offsetX / progressBar.clientWidth) * audioTrack.duration;
      await this.playSelectedTrack();
      this.updatePlayingTrackVisuals();
    } else {
      this.utils.handleError('Audio track or progress bar element not found.');
    }
  };

  /**
   * Обработчик обновления времени воспроизведения аудио.
   * Обновляет визуальное отображение прогресса и текущего времени трека.
   * @param {Event} event - Событие обновления времени.
   * @private
   */
  private handleAudioTrackTimeUpdate = (event: Event): void => {
    const { currentTime, duration } = event.target as HTMLAudioElement;
    const progressPercentage = (currentTime / duration) * 100;
    const { progressBar, currentTime: currentTimeElement } = this.state.elements;

    if (progressBar?.firstElementChild instanceof HTMLElement) {
      progressBar.firstElementChild.style.width = `${progressPercentage}%`;
    }

    if (currentTimeElement) {
      currentTimeElement.textContent = this.formatTime(currentTime);
    }
  };

  /**
   * Обработчик окончания воспроизведения трека.
   * Определяет дальнейшее действие в зависимости от режима повтора.
   * @returns {Promise<void>}
   * @private
   */
  private async handleAudioTrackEnd(): Promise<void> {
    const repeatMode = this.state.elements.repeatTrack?.dataset.repeatTrack as 'repeat' | 'repeat_one' | 'shuffle';
    const actions: Record<typeof repeatMode, () => Promise<void>> = {
      repeat: async () => this.handleTrackChange('next'),
      repeat_one: async () => {
        if (this.state.elements.audioTrack instanceof HTMLAudioElement) {
          this.state.elements.audioTrack.currentTime = 0;
          await this.playSelectedTrack();
        }
      },
      shuffle: async () => {
        this.state.musicIndex = this.getRandomTrackIndex();
        this.updateCurrentTrackInfo(this.state.musicIndex);
        await this.playSelectedTrack();
        this.updatePlayingTrackVisuals();
      },
    };

    await actions[repeatMode]();
  }

  /**
   * Обработчик загрузки аудио-трека.
   * Устанавливает отображение общей длительности трека.
   * @private
   */
  private handleAudioTrackLoaded = (): void => {
    const { audioTrack, duration } = this.state.elements;
    if (audioTrack instanceof HTMLAudioElement && duration) {
      duration.innerText = this.formatTime(audioTrack.duration);
    }
  };

  /**
   * Получает случайный индекс трека, отличный от текущего.
   * @returns {number} Случайный индекс трека.
   * @private
   */
  private getRandomTrackIndex(): number {
    let newIndex: number;
    do {
      newIndex = Math.floor(Math.random() * musicTracks.length + 1);
    } while (newIndex === this.state.musicIndex);
    return newIndex;
  }
}

new MusicPlayer();
