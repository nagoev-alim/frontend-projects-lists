/**
 * Музыкальный плеер
 *
 * Этот модуль реализует функциональность музыкального плеера с возможностью
 * воспроизведения, паузы, переключения треков, отображения плейлиста и
 * управления повтором/перемешиванием. Плеер использует предварительно
 * загруженный список треков и отображает информацию о текущем треке,
 * включая обложку, название и исполнителя.
 */

import './style.css';
import MOCK from './mock.js';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import { icons } from 'feather-icons';


class MusicPlayer {
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
      musicIndex: Math.floor(Math.random() * MOCK.length + 1),
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
   * Создает HTML-разметку приложения
   */
  createAppHTML() {
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
   * Инициализирует DOM элементы
   */
  initDOMElements() {
    this.state.elements = {
      audioCover: document.querySelector(this.config.selectors.audioCover),
      audioTrack: document.querySelector(this.config.selectors.audioTrack),
      closePlaylist: document.querySelector(this.config.selectors.closePlaylist),
      currentTime: document.querySelector(this.config.selectors.currentTime),
      duration: document.querySelector(this.config.selectors.duration),
      nextTrack: document.querySelector(this.config.selectors.nextTrack),
      playPause: document.querySelector(this.config.selectors.playPause),
      playlist: document.querySelector(this.config.selectors.playlist),
      prevTrack: document.querySelector(this.config.selectors.prevTrack),
      progressBar: document.querySelector(this.config.selectors.progressBar),
      repeatTrack: document.querySelector(this.config.selectors.repeatTrack),
      showPlaylist: document.querySelector(this.config.selectors.showPlaylist),
      trackArtist: document.querySelector(this.config.selectors.trackArtist),
      trackList: document.querySelector(this.config.selectors.trackList),
      trackName: document.querySelector(this.config.selectors.trackName),
      playerContainer: document.querySelector(this.config.selectors.playerContainer),
    };
  }

  /**
   * Инициализирует приложение
   */
  init() {
    this.createAppHTML();
    this.initDOMElements();
    window.addEventListener('load', () => {
      this.populateMusicList();
      this.updateCurrentTrackInfo(this.state.musicIndex);
      this.updatePlayingTrackVisuals();
    });
    this.state.elements.playPause.addEventListener('click', this.handlePlayPauseClick.bind(this));
    this.state.elements.nextTrack.addEventListener('click', () => this.handleTrackChange('next'));
    this.state.elements.prevTrack.addEventListener('click', () => this.handleTrackChange('prev'));
    this.state.elements.repeatTrack.addEventListener('click', this.handleRepeatTrackClick.bind(this));
    [this.state.elements.showPlaylist, this.state.elements.closePlaylist].forEach((button) =>
      button.addEventListener('click', () =>
        this.state.elements.playlist.classList.toggle('open'),
      ),
    );
    this.state.elements.progressBar.addEventListener('click', this.handleProgressBarClick.bind(this));
    this.state.elements.audioTrack.addEventListener('timeupdate', this.handleAudioTrackTimeUpdate.bind(this));
    this.state.elements.audioTrack.addEventListener('loadeddata', () => {
      this.state.elements.duration.innerText = this.formatTime(this.state.elements.audioTrack.duration);
    });
    this.state.elements.audioTrack.addEventListener('ended', this.handleAudioTrackEnd.bind(this));
  }


  /**
   * Заполняет список треков
   */
  populateMusicList() {
    MOCK.forEach((track, index) => {
      const li = this.createTrackListItem(track, index);
      this.state.elements.trackList.append(li);
      this.setupTrackDuration(li);
    });
  }

  /**
   * Создает элемент списка для трека
   * @param {Object} track - Информация о треке
   * @param {string} track.name - Название трека
   * @param {string} track.artist - Исполнитель
   * @param {string} track.src - Путь к аудиофайлу
   * @param {number} index - Индекс трека
   * @returns {HTMLLIElement} Элемент списка
   */
  createTrackListItem({ name, artist, src }, index) {
    const li = document.createElement('li');
    li.dataset.index = index + 1;
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
   * Настраивает отображение длительности трека
   * @param {HTMLLIElement} li - Элемент списка трека
   */
  setupTrackDuration(li) {
    const duration = li.querySelector('[data-duration]');
    const song = li.querySelector('[data-song]');
    song.addEventListener('loadeddata', () => this.updateDuration(duration, song.duration));
  }

  /**
   * Обновляет отображение длительности трека
   * @param {HTMLElement} element - Элемент для отображения длительности
   * @param {number} time - Длительность трека в секундах
   */
  updateDuration(element, time) {
    const formattedTime = this.formatTime(time);
    element.textContent = formattedTime;
    element.dataset.totalDuration = formattedTime;
  }

  /**
   * Форматирует время в минуты и секунды
   * @param {number} time - Время в секундах
   * @returns {string} Отформатированное время
   */
  formatTime(time) {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${this.utils.addLeadingZero(seconds)}`;
  }

  /**
   * Обновляет информацию о текущем треке
   * @param {number} index - Индекс трека
   */
  updateCurrentTrackInfo(index) {
    const { name, artist, img, src } = MOCK[index - 1];

    this.state.elements.trackName.textContent = name;
    this.state.elements.trackArtist.textContent = artist;
    this.state.elements.audioCover.src = img;
    this.state.elements.audioTrack.src = src;
  }

  /**
   * Обновляет визуальное отображение играющего трека
   */
  updatePlayingTrackVisuals() {
    const trackListItems = Array.from(this.state.elements.trackList.querySelectorAll('li'));

    trackListItems.forEach((track) => {
      const trackIndex = Number(track.dataset.index);
      const isPlaying = trackIndex === this.state.musicIndex;

      const trackDurationElement = track.querySelector('[data-duration]');
      const trackTotalDuration = trackDurationElement.dataset.totalDuration;

      track.addEventListener('click', async ({ target: { dataset: { index } } }) => {
        this.state.musicIndex = Number(index);
        this.updateCurrentTrackInfo(this.state.musicIndex);
        await this.playSelectedTrack();
        this.updatePlayingTrackVisuals();
      });

      track.classList.toggle('playing', isPlaying);
      trackDurationElement.textContent = isPlaying ? 'Playing' : trackTotalDuration;
    });
  }

  /**
   * Воспроизводит выбранный трек
   * @async
   * @function playSelectedTrack
   * @description Запускает воспроизведение текущего трека, обновляет UI и обрабатывает возможные ошибки
   * @throws {Error} Если возникает ошибка при воспроизведении трека
   */
  async playSelectedTrack() {
    this.state.elements.playerContainer.classList.add('paused');
    this.state.elements.playPause.innerHTML = icons.pause.toSvg();
    try {
      await this.state.elements.audioTrack.pause();
      await this.state.elements.audioTrack.play();
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log(
          'Play request was interrupted, likely due to a new track being loaded.',
        );
      } else {
        this.utils.handleError('Error occurred while playing the track.', error);
      }
    }
  }

  /**
   * Обрабатывает клик по кнопке воспроизведения/паузы
   * @async
   * @function handlePlayPauseClick
   * @description Переключает состояние воспроизведения между play и pause
   */
  async handlePlayPauseClick() {
    this.state.elements.playerContainer.classList.contains('paused')
      ? this.pauseSelectedTrack()
      : await this.playSelectedTrack();
    this.updatePlayingTrackVisuals();
  }

  /**
   * Ставит на паузу текущий трек
   * @function pauseSelectedTrack
   * @description Приостанавливает воспроизведение текущего трека и обновляет UI
   */
  pauseSelectedTrack() {
    this.state.elements.playerContainer.classList.remove('paused');
    this.state.elements.playPause.innerHTML = icons.play.toSvg();
    this.state.elements.audioTrack.pause();
  }

  /**
   * Обрабатывает смену трека
   * @async
   * @function handleTrackChange
   * @param {string} direction - Направление смены ('next' или 'prev')
   * @description Переключает на следующий или предыдущий трек в зависимости от направления
   */
  async handleTrackChange(direction) {
    const step = direction === 'next' ? 1 : -1;
    this.state.musicIndex = ((this.state.musicIndex - 1 + step + MOCK.length) % MOCK.length) + 1;
    this.updateCurrentTrackInfo(this.state.musicIndex);
    await this.playSelectedTrack();
    this.updatePlayingTrackVisuals();
  }

  /**
   * Обрабатывает клик по кнопке повтора
   * @function handleRepeatTrackClick
   * @param {Event} event - Объект события клика
   * @description Циклически меняет режим повтора и обновляет соответствующую иконку и подсказку
   */
  handleRepeatTrackClick({ target }) {
    const { icon, title, next } = this.config.REPEAT_TYPES[target.dataset.repeatTrack];
    target.innerHTML = icon;
    target.title = title;
    target.dataset.repeatTrack = next;
  }

  /**
   * Обрабатывает клик по полосе прогресса
   * @async
   * @function handleProgressBarClick
   * @param {Event} event - Объект события клика
   * @description Устанавливает время воспроизведения трека в соответствии с местом клика на полосе прогресса
   */
  async handleProgressBarClick({ offsetX }) {
    this.state.elements.audioTrack.currentTime =
      (offsetX / this.state.elements.progressBar.clientWidth) * this.state.elements.audioTrack.duration;
    await this.playSelectedTrack();
    this.updatePlayingTrackVisuals();
  }

  /**
   * Обновляет отображение времени воспроизведения
   * @function handleAudioTrackTimeUpdate
   * @param {Event} event - Объект события обновления времени
   * @description Обновляет полосу прогресса и текущее время воспроизведения
   */
  handleAudioTrackTimeUpdate({ target: { currentTime, duration } }) {
    const progressPercentage = (currentTime / duration) * 100;
    this.state.elements.progressBar.children[0].style.width = `${progressPercentage}%`;

    this.state.elements.currentTime.textContent = this.formatTime(currentTime);
  }

  /**
   * Обрабатывает окончание воспроизведения трека
   * @async
   * @function handleAudioTrackEnd
   * @description Определяет следующее действие в зависимости от текущего режима повтора
   */
  async handleAudioTrackEnd() {
    const repeatMode = this.state.elements.repeatTrack.dataset.repeatTrack;
    const actions = {
      repeat: async () => await this.handleTrackChange('next'),
      repeat_one: async () => {
        this.state.elements.audioTrack.currentTime = 0;
        await this.playSelectedTrack();
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
   * Возвращает случайный индекс трека
   * @function getRandomTrackIndex
   * @returns {number} Случайный индекс трека, отличный от текущего
   * @description Генерирует случайный индекс трека, исключая текущий трек
   */
  getRandomTrackIndex() {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * MOCK.length + 1);
    } while (newIndex === this.state.musicIndex);
    return newIndex;
  }
}

new MusicPlayer();
