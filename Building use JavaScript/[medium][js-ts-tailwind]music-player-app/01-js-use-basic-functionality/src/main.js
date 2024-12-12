/**
 * Музыкальный плеер
 *
 * Этот модуль реализует функциональность музыкального плеера с возможностью
 * воспроизведения, паузы, переключения треков, отображения плейлиста и
 * управления повтором/перемешиванием. Плеер использует предварительно
 * загруженный список треков и отображает информацию о текущем треке,
 * включая обложку, название и исполнителя.
 */

// Основные стили
import './style.css';
import MOCK from './mock.js';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import { icons } from 'feather-icons';

/**
 * Конфигурация приложения
 * @typedef {Object} AppConfig
 * @property {string} root - Селектор корневого элемента
 * @property {Object} selectors - Селекторы элементов интерфейса
 * @property {Object} REPEAT_TYPES - Типы повтора воспроизведения
 */
const APP_CONFIG = {
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
 * @typedef {Object} AppState
 * @property {Object} elements - DOM элементы
 * @property {number} musicIndex - Индекс текущего трека
 */
const APP_STATE = {
  elements: {},
  musicIndex: Math.floor(Math.random() * MOCK.length + 1),
};

/**
 * Утилиты приложения
 * @typedef {Object} AppUtils
 * @property {Function} addLeadingZero - Добавляет ведущий ноль к числу
 * @property {Function} renderDataAttributes - Удаляет квадратные скобки из строки
 * @property {Object} toastConfig - Конфигурация для уведомлений
 * @property {Function} showToast - Отображает уведомление
 * @property {Function} handleError - Обрабатывает ошибки
 */
const APP_UTILS = {
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
      ...APP_UTILS.toastConfig,
    }).showToast();
  },
  handleError: (message, error = null) => {
    APP_UTILS.showToast(message);
    if (error) console.error(message, error);
  },
};

/**
 * Создает HTML-разметку приложения
 */
function createAppHTML() {
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
 * Инициализирует DOM элементы
 */
function initDOMElements() {
  APP_STATE.elements = {
    audioCover: document.querySelector(APP_CONFIG.selectors.audioCover),
    audioTrack: document.querySelector(APP_CONFIG.selectors.audioTrack),
    closePlaylist: document.querySelector(APP_CONFIG.selectors.closePlaylist),
    currentTime: document.querySelector(APP_CONFIG.selectors.currentTime),
    duration: document.querySelector(APP_CONFIG.selectors.duration),
    nextTrack: document.querySelector(APP_CONFIG.selectors.nextTrack),
    playPause: document.querySelector(APP_CONFIG.selectors.playPause),
    playlist: document.querySelector(APP_CONFIG.selectors.playlist),
    prevTrack: document.querySelector(APP_CONFIG.selectors.prevTrack),
    progressBar: document.querySelector(APP_CONFIG.selectors.progressBar),
    repeatTrack: document.querySelector(APP_CONFIG.selectors.repeatTrack),
    showPlaylist: document.querySelector(APP_CONFIG.selectors.showPlaylist),
    trackArtist: document.querySelector(APP_CONFIG.selectors.trackArtist),
    trackList: document.querySelector(APP_CONFIG.selectors.trackList),
    trackName: document.querySelector(APP_CONFIG.selectors.trackName),
    playerContainer: document.querySelector(APP_CONFIG.selectors.playerContainer),
  };
}

/**
 * Инициализирует приложение
 */
function initApp() {
  createAppHTML();
  initDOMElements();
  window.addEventListener('load', () => {
    populateMusicList();
    updateCurrentTrackInfo(APP_STATE.musicIndex);
    updatePlayingTrackVisuals();
  });
  APP_STATE.elements.playPause.addEventListener('click', handlePlayPauseClick);
  APP_STATE.elements.nextTrack.addEventListener('click', () => handleTrackChange('next'));
  APP_STATE.elements.prevTrack.addEventListener('click', () => handleTrackChange('prev'));
  APP_STATE.elements.repeatTrack.addEventListener('click', handleRepeatTrackClick);
  [APP_STATE.elements.showPlaylist, APP_STATE.elements.closePlaylist].forEach((button) =>
    button.addEventListener('click', () =>
      APP_STATE.elements.playlist.classList.toggle('open'),
    ),
  );
  APP_STATE.elements.progressBar.addEventListener('click', handleProgressBarClick);
  APP_STATE.elements.audioTrack.addEventListener('timeupdate', handleAudioTrackTimeUpdate);
  APP_STATE.elements.audioTrack.addEventListener('loadeddata', () => {
    APP_STATE.elements.duration.innerText = formatTime(APP_STATE.elements.audioTrack.duration);
  });
  APP_STATE.elements.audioTrack.addEventListener('ended', handleAudioTrackEnd);
}

/**
 * Заполняет список треков
 */
function populateMusicList() {
  MOCK.forEach((track, index) => {
    const li = createTrackListItem(track, index);
    APP_STATE.elements.trackList.append(li);
    setupTrackDuration(li);
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
function createTrackListItem({ name, artist, src }, index) {
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
function setupTrackDuration(li) {
  const duration = li.querySelector('[data-duration]');
  const song = li.querySelector('[data-song]');
  song.addEventListener('loadeddata', () =>
    updateDuration(duration, song.duration),
  );
}

/**
 * Обновляет отображение длительности трека
 * @param {HTMLElement} element - Элемент для отображения длительности
 * @param {number} time - Длительность трека в секундах
 */
function updateDuration(element, time) {
  const formattedTime = formatTime(time);
  element.textContent = formattedTime;
  element.dataset.totalDuration = formattedTime;
}

/**
 * Форматирует время в минуты и секунды
 * @param {number} time - Время в секундах
 * @returns {string} Отформатированное время
 */
function formatTime(time) {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${APP_UTILS.addLeadingZero(seconds)}`;
}

/**
 * Обновляет информацию о текущем треке
 * @param {number} index - Индекс трека
 */
function updateCurrentTrackInfo(index) {
  const { name, artist, img, src } = MOCK[index - 1];

  APP_STATE.elements.trackName.textContent = name;
  APP_STATE.elements.trackArtist.textContent = artist;
  APP_STATE.elements.audioCover.src = img;
  APP_STATE.elements.audioTrack.src = src;
}

/**
 * Обновляет визуальное отображение играющего трека
 */
function updatePlayingTrackVisuals() {
  const trackListItems = Array.from(APP_STATE.elements.trackList.querySelectorAll('li'));

  trackListItems.forEach((track) => {
    const trackIndex = Number(track.dataset.index);
    const isPlaying = trackIndex === APP_STATE.musicIndex;

    const trackDurationElement = track.querySelector('[data-duration]');
    const trackTotalDuration = trackDurationElement.dataset.totalDuration;

    track.addEventListener('click', async ({ target: { dataset: { index } } }) => {
      APP_STATE.musicIndex = Number(index);
      updateCurrentTrackInfo(APP_STATE.musicIndex);
      await playSelectedTrack();
      updatePlayingTrackVisuals();
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
async function playSelectedTrack() {
  APP_STATE.elements.playerContainer.classList.add('paused');
  APP_STATE.elements.playPause.innerHTML = icons.pause.toSvg();
  try {
    await APP_STATE.elements.audioTrack.pause();
    await APP_STATE.elements.audioTrack.play();
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log(
        'Play request was interrupted, likely due to a new track being loaded.',
      );
    } else {
      APP_UTILS.handleError('Error occurred while playing the track.', error);
    }
  }
}

/**
 * Обрабатывает клик по кнопке воспроизведения/паузы
 * @async
 * @function handlePlayPauseClick
 * @description Переключает состояние воспроизведения между play и pause
 */
async function handlePlayPauseClick() {
  APP_STATE.elements.playerContainer.classList.contains('paused')
    ? pauseSelectedTrack()
    : await playSelectedTrack();
  updatePlayingTrackVisuals();
}

/**
 * Ставит на паузу текущий трек
 * @function pauseSelectedTrack
 * @description Приостанавливает воспроизведение текущего трека и обновляет UI
 */
function pauseSelectedTrack() {
  APP_STATE.elements.playerContainer.classList.remove('paused');
  APP_STATE.elements.playPause.innerHTML = icons.play.toSvg();
  APP_STATE.elements.audioTrack.pause();
}

/**
 * Обрабатывает смену трека
 * @async
 * @function handleTrackChange
 * @param {string} direction - Направление смены ('next' или 'prev')
 * @description Переключает на следующий или предыдущий трек в зависимости от направления
 */
async function handleTrackChange(direction) {
  const step = direction === 'next' ? 1 : -1;
  APP_STATE.musicIndex = ((APP_STATE.musicIndex - 1 + step + MOCK.length) % MOCK.length) + 1;
  updateCurrentTrackInfo(APP_STATE.musicIndex);
  await playSelectedTrack();
  updatePlayingTrackVisuals();
}

/**
 * Обрабатывает клик по кнопке повтора
 * @function handleRepeatTrackClick
 * @param {Event} event - Объект события клика
 * @description Циклически меняет режим повтора и обновляет соответствующую иконку и подсказку
 */
function handleRepeatTrackClick({ target }) {
  const { icon, title, next } = APP_CONFIG.REPEAT_TYPES[target.dataset.repeatTrack];
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
async function handleProgressBarClick({ offsetX }) {
  APP_STATE.elements.audioTrack.currentTime =
    (offsetX / APP_STATE.elements.progressBar.clientWidth) * APP_STATE.elements.audioTrack.duration;
  await playSelectedTrack();
  updatePlayingTrackVisuals();
}

/**
 * Обновляет отображение времени воспроизведения
 * @function handleAudioTrackTimeUpdate
 * @param {Event} event - Объект события обновления времени
 * @description Обновляет полосу прогресса и текущее время воспроизведения
 */
function handleAudioTrackTimeUpdate({ target: { currentTime, duration } }) {
  const progressPercentage = (currentTime / duration) * 100;
  APP_STATE.elements.progressBar.children[0].style.width = `${progressPercentage}%`;

  APP_STATE.elements.currentTime.textContent = formatTime(currentTime);
}

/**
 * Обрабатывает окончание воспроизведения трека
 * @async
 * @function handleAudioTrackEnd
 * @description Определяет следующее действие в зависимости от текущего режима повтора
 */
async function handleAudioTrackEnd() {
  const repeatMode = APP_STATE.elements.repeatTrack.dataset.repeatTrack;
  const actions = {
    repeat: async () => await handleTrackChange('next'),
    repeat_one: async () => {
      APP_STATE.elements.audioTrack.currentTime = 0;
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
 * Возвращает случайный индекс трека
 * @function getRandomTrackIndex
 * @returns {number} Случайный индекс трека, отличный от текущего
 * @description Генерирует случайный индекс трека, исключая текущий трек
 */
function getRandomTrackIndex() {
  let newIndex;
  do {
    newIndex = Math.floor(Math.random() * MOCK.length + 1);
  } while (newIndex === APP_STATE.musicIndex);
  return newIndex;
}

initApp();
