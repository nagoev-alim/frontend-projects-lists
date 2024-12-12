import './style.css';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import axios from 'axios';

const APP_CONFIG = {
  root: '#app',
  selectors: {
    weatherForm: '[data-weather-form]',
    weatherDetails: '[data-weather-details]',
  },
  url: 'https://api.weatherapi.com/v1/forecast.json?key=2260a9d16e4a45e1a44115831212511&q=',
};

const APP_STATE = {
  elements: {
    weatherForm: null,
    weatherDetails: null,
  },
};

const APP_UTILS = {
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

function createAppHTML() {
  const { root, selectors: { weatherForm, weatherDetails } } = APP_CONFIG;
  const { renderDataAttributes } = APP_UTILS;
  const rootElement = document.querySelector(root);

  if (!rootElement) return;

  rootElement.innerHTML = `
    <div class='grid max-w-md w-full gap-4 rounded border bg-white p-3 shadow'>
      <h1 class='text-center text-2xl font-bold md:text-4xl'>Weather</h1>
      <header>
        <p class='text-center text-lg font-medium'>
          ${new Date().getDate()},
          ${new Date().toLocaleString('en-En', { month: 'short' })},
          ${new Date().getFullYear()}
        </p>
        <form class='grid gap-2' ${renderDataAttributes(weatherForm)}>
          <label class='grid gap-2 place-items-center text-center'>
            <span class='label'>Search for city</span>
            <input
              class='w-full rounded border-2 px-3 py-2 focus:border-blue-400 focus:outline-none'
              type='text'
              name='query'
              autocomplete='off'
              placeholder='Enter city name'
            />
          </label>
          <button class='border px-3 py-2 hover:bg-slate-50' type='submit'>Submit</button>
        </form>
      </header>
      <div class='grid gap-2 place-items-center' ${renderDataAttributes(weatherDetails)}></div>
    </div>    
  `;
}

function initDOMElements() {
  APP_STATE.elements = {
    weatherForm: document.querySelector(APP_CONFIG.selectors.weatherForm),
    weatherFormButton: document.querySelector(`${APP_CONFIG.selectors.weatherForm} button[type="submit"]`),
    weatherDetails: document.querySelector(APP_CONFIG.selectors.weatherDetails),
  };
}

function initApp() {
  createAppHTML();
  initDOMElements();

  (async () => {
    await fetchStoredCityWeather();
    APP_STATE.elements.weatherForm.addEventListener('submit', handleWeatherFormSubmit);
  })();
}

async function fetchStoredCityWeather() {
  const storedCity = localStorage.getItem('city');
  if (storedCity) {
    await getWeather(storedCity, false);
  }
}

function renderUI(
  text,
  icon,
  is_day,
  temp_c,
  forecastday,
  name,
  region,
  country,
) {
  APP_STATE.elements.weatherDetails.innerHTML = `
    <h3 class='text-center text-lg font-bold'>
      <span>${name}</span> ${region}, ${country}
    </h3>
    <p>${text}</p>
    <img src='${icon}' alt='${text}'>
    <p class='text-xl font-medium'>${is_day ? 'Day' : 'Night'}</p>
    <p class='text-2xl font-bold'><span>${temp_c}</span><sup>&deg;</sup></p>
    <ul class='grid gap-2 sm:grid-cols-3 sm:gap-5'>
      ${forecastday
    .map(
      ({ date, day: { mintemp_c, maxtemp_c } }) => `
        <li class='grid place-items-center gap-1'>
          <p>${date}</p>
          <div>
            <p><span class='font-bold'>Min:</span> ${mintemp_c}<sup>&deg;</sup></p>
            <p><span class='font-bold'>Max:</span> ${maxtemp_c}<sup>&deg;</sup></p>
          </div>
        </li>`,
    )
    .join('')}
    </ul>
  `;
}

async function handleWeatherFormSubmit(event) {
  event.preventDefault();
  const query = new FormData(event.target).get('query').trim();
  if (!query) {
    APP_UTILS.showToast('Please enter a city name');
    return;
  }
  await getWeather(query, true);
}

async function getWeather(query, saveToLocalStorage = false) {
  try {
    APP_STATE.elements.weatherFormButton.textContent = 'Loading...';
    const { data } = await axios.get(`${APP_CONFIG.url}${query}&days=5&aqi=no&alerts=no`);
    const { current, forecast, location } = data;

    renderUI(
      current.condition.text,
      current.condition.icon,
      current.is_day,
      current.temp_c,
      forecast.forecastday,
      location.name,
      location.region,
      location.country,
    );

    if (saveToLocalStorage) {
      localStorage.setItem('city', query);
    }
  } catch (error) {
    APP_UTILS.handleError('Failed to load weather data', error);
  } finally {
    APP_STATE.elements.weatherFormButton.textContent = 'Submit';
    APP_STATE.elements.weatherForm.reset();
  }
}

initApp();
