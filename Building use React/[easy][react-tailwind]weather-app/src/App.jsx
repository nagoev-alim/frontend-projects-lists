import { Toaster } from 'react-hot-toast';
import { Head } from './components/layout';
import { Header } from './components/functional';
import { useCallback, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { weatherActions, weatherSelectors } from './features/weather';
import { showToast } from './utils';
import { LANG } from './lang';
import { Loader } from './components/ui/index.js';


const SearchForm = ({ query, setQuery, onSubmit }) => (
  <form className="grid gap-2" onSubmit={onSubmit}>
    <label className="grid gap-2 place-items-center text-center">
      <span className="text-sm font-medium">{LANG.SEARCH_FORM.label}</span>
      <input
        className="w-full rounded border-2 px-3 py-2 focus:border-blue-400 focus:outline-none"
        type="text"
        name="query"
        autoComplete="off"
        placeholder={LANG.SEARCH_FORM.placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
    </label>
    <button
      className="border px-3 py-2 hover:bg-slate-50 transition-colors duration-200"
      type="submit"
      aria-label={LANG.SEARCH_FORM.submitButton}
    >
      {LANG.SEARCH_FORM.submitButton}
    </button>
  </form>
);

const WeatherDisplay = ({ weather }) => (
  <div className="grid gap-2 place-items-center">
    <h3 className="text-center text-lg font-bold">
      <span>{weather.name}</span> {weather.region}, {weather.country}
    </h3>
    <p>{weather.text}</p>
    <img src={weather.icon} alt={weather.text} />
    <p className="text-xl font-medium">{weather.is_day ? LANG.WEATHER_DISPLAY.day : LANG.WEATHER_DISPLAY.night}</p>
    <p className="text-2xl font-bold"><span>{weather.temp_c}</span><sup>&deg;</sup></p>
    <ul className="grid gap-2 sm:grid-cols-3 sm:gap-5">
      {weather.forecastday.map(({ date, day: { mintemp_c, maxtemp_c } }) => (
        <li className="grid place-items-center gap-1" key={date}>
          <p>{date}</p>
          <div>
            <p><span className="font-bold">{LANG.WEATHER_DISPLAY.min}</span> {mintemp_c}<sup>&deg;</sup></p>
            <p><span className="font-bold">{LANG.WEATHER_DISPLAY.max}</span> {maxtemp_c}<sup>&deg;</sup></p>
          </div>
        </li>
      ))}
    </ul>
  </div>
);

const App = () => {
  const dispatch = useDispatch();
  const weather = useSelector(weatherSelectors.selectWeather);
  const { status, error, message } = useSelector(weatherSelectors.selectRequest);
  const [query, setQuery] = useState('');

  const handleFormSubmit = useCallback((e) => {
    e.preventDefault();
    if (!query || query.trim().length === 0) {
      showToast(LANG.APP.queryError, 'error');
      return;
    }
    dispatch(weatherActions.searchByQuery(query));
    setQuery('');
  }, [query, dispatch]);

  const formattedDate = useMemo(() => {
    const now = new Date();
    return `${now.getDate()}, ${now.toLocaleString('en-EN', { month: 'short' })}, ${now.getFullYear()}`;
  }, []);

  return (
    <>
      <Head description="" title="" keywords="" />
      <div className="bg-neutral-100 min-h-screen dark:bg-neutral-500">
        <div className="w-full grid gap-3">
          <Header />
          <div className="w-full max-w-2xl mx-auto p-4 grid gap-3 bg-white shadow-md rounded-lg">
            <header>
              <p className="text-center text-lg font-medium">{formattedDate}</p>
              <SearchForm query={query} setQuery={setQuery} onSubmit={handleFormSubmit} />
            </header>
            {status === 'loading' && <Loader isLoading={true}/>}
            {status === 'success' && weather && <WeatherDisplay weather={weather} />}
            {error && <p className="text-red-500 text-center">{message}</p>}
          </div>
        </div>
        <Toaster />
      </div>
    </>
  );
};

export default App;
