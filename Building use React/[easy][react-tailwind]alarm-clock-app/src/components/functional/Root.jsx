
import { useState, useCallback, useEffect } from 'react';
import { PiBellSimpleRingingDuotone } from 'react-icons/pi';
import { addLeadingZero, showToast } from '@utils';
import { Button } from '@ui';


/**
 * Компонент для отображения списка опций в выпадающем списке.
 * @param {Object} props - Свойства компонента.
 * @param {string[]} props.value - Массив значений для опций.
 * @returns {JSX.Element} Список элементов option.
 */
const Options = ({ value }) => value.map((option, index) => (
  <option value={option} key={index}>{option}</option>
));

/**
 * Компонент выпадающего списка с настраиваемыми опциями.
 * @param {Object} props - Свойства компонента.
 * @param {string} props.value - Текущее выбранное значение.
 * @param {function} props.onChange - Функция обработки изменения выбора.
 * @param {boolean} props.disabled - Флаг, указывающий, отключен ли выпадающий список.
 * @param {string[]} props.options - Массив доступных опций.
 * @param {string} props.defaultOption - Значение опции по умолчанию.
 * @returns {JSX.Element} Компонент выпадающего списка.
 */
const SelectField = ({ value, onChange, disabled, options, defaultOption }) => (
  <select
    className="border-2 px-4 py-2.5 rounded block w-full cursor-pointer"
    value={value}
    onChange={onChange}
    disabled={disabled}
  >
    <option value={defaultOption}>{defaultOption}</option>
    <Options value={options} />
  </select>
);

/**
 * Компонент будильника.
 * @returns {JSX.Element} Компонент будильника.
 */
function Root() {
  /**
   * @typedef {Object} AlarmState
   * @property {boolean} isAlarmSet - Флаг, указывающий, установлен ли будильник.
   * @property {string} alarmTime - Время будильника в формате "HH:MM AM/PM".
   * @property {boolean} animIcon - Флаг для анимации иконки будильника.
   * @property {string} timeString - Текущее время в формате "HH:MM:SS AM/PM".
   * @property {string} buttonText - Текст на кнопке установки/сброса будильника.
   * @property {HTMLAudioElement|null} alarmSound - Аудиоэлемент для звука будильника.
   * @property {string} selectedHour - Выбранный час для будильника.
   * @property {string} selectedMinute - Выбранная минута для будильника.
   * @property {string} selectedPeriod - Выбранный период (AM/PM) для будильника.
   */
  const [alarmSound, setAlarmSound] = useState(null);
  const [isAlarmSet, setIsAlarmSet] = useState(false);
  const [animIcon, setAnimIcon] = useState(false);
  const [alarmTime, setAlarmTime] = useState('');
  const [timeString, setTimeString] = useState('00:00:00 PM');
  const [buttonText, setButtonText] = useState('Set Alarm');
  const [selectedHour, setSelectedHour] = useState('Hour');
  const [selectedMinute, setSelectedMinute] = useState('Minute');
  const [selectedPeriod, setSelectedPeriod] = useState('AM/PM');

  /**
   * Генерирует массив отформатированных строк времени.
   * @param {number} num - Количество элементов для генерации.
   * @returns {string[]} Массив отформатированных строк времени.
   */
  const generateFormattedTime = (num) => Array.from({ length: num }, (_, i) => addLeadingZero(i + 1));

  /**
   * Обработчик изменения значения в выпадающем списке.
   * @param setter - Функция для установки нового значения.
   */
  const handleSelectChange = (setter) => (e) => setter(e.target.value);


  /**
   * @function resetAlarm
   * @returns {void}
   * Сбрасывает все настройки будильника в исходное состояние.
   * Эта функция выполняет следующие действия:
   * - Отключает установленный будильник
   * - Сбрасывает текст кнопки на "Set Alarm"
   * - Очищает установленное время будильника
   * - Останавливает воспроизведение звука будильника (если он воспроизводится)
   * - Удаляет ссылку на аудио-объект будильника
   * - Сбрасывает выбранные значения часа, минуты и периода (AM/PM) на значения по умолчанию
   * - Отключает анимацию иконки будильника
   */
  const resetAlarm = () => {
    setIsAlarmSet(false);
    setButtonText('Set Alarm');
    setAlarmTime('');
    alarmSound?.pause();
    setAlarmSound(null);
    setSelectedHour('Hour');
    setSelectedMinute('Minute');
    setSelectedPeriod('AM/PM');
    setAnimIcon(false);
  };


  /**
   * @function handleSetAlarmClick
   * Обрабатывает нажатие на кнопку установки/сброса будильника.
   * Эта функция выполняет следующие действия:
   * - Если будильник уже установлен, сбрасывает его
   * - Проверяет корректность выбранного времени
   * - При некорректном времени показывает сообщение об ошибке
   * - При корректном времени устанавливает будильник
   */
  function handleSetAlarmClick() {
    if (isAlarmSet) {
      resetAlarm();
      return;
    }

    if (!(Number(selectedHour) && Number(selectedMinute) && selectedPeriod !== 'AM/PM')) {
      showToast('Please, select a valid time to set alarm!', 'error');
      return;
    }

    setAlarmTime(`${addLeadingZero(selectedHour)}:${addLeadingZero(selectedMinute)} ${selectedPeriod}`);
    setIsAlarmSet(true);
    setButtonText('Clear Alarm');
  }

  /**
   * @function formatTime
   * Форматирует дату в массив строк времени.
   * @description
   * Функция принимает объект Date и преобразует его в удобный для чтения формат.
   * Она разбивает время на часы, минуты, секунды и определяет период (AM/PM).
   * Часы преобразуются в 12-часовой формат, а все значения дополняются нулями до двух цифр.
   */
  const formatTime = (date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    const period = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = (hours % 12 || 12).toString().padStart(2, '0');
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedSeconds = seconds.toString().padStart(2, '0');

    return [formattedHours, formattedMinutes, formattedSeconds, period];
  };


  /**
   * @function updateTime
   * Обновляет текущее время и проверяет, нужно ли активировать будильник.
   * @description
   * Эта функция вызывается каждую секунду для обновления отображаемого времени.
   * Если текущее время совпадает с установленным временем будильника,
   * функция запускает звук будильника и активирует анимацию иконки.
   *
   * @returns {void}
   */
  const updateTime = useCallback(() => {
    const [h, m, s, ampm] = formatTime(new Date());
    setTimeString(`${h}:${m}:${s} ${ampm}`);
    if (alarmTime === `${h}:${m} ${ampm}`) {
      alarmSound.play();
      alarmSound.loop = true;
      setAnimIcon(true);
    }
  }, [alarmSound, alarmTime]);

  /**
   * @function timeUpdateEffect
   * @description
   * Этот эффект устанавливает интервал, который вызывает функцию updateTime
   * каждую секунду. При размонтировании компонента интервал очищается.
   */
  useEffect(() => {
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, [updateTime]);

  /**
   * @function audioLoadEffect
   * @description
   * Этот эффект асинхронно загружает аудио файл для звука будильника.
   * В случае ошибки при загрузке или создании аудио объекта,
   * ошибка логируется в консоль.
   */
  useEffect(() => {
    const loadAudio = async () => {
      try {
        const audio = new Audio('/sound.mp3');
        audio.addEventListener('error', (e) => {
          console.error('Error loading audio:', e);
        });
        setAlarmSound(audio);
      } catch (error) {
        console.error('Failed to create audio object:', error);
      }
    };

    loadAudio();
  }, []);
  return (
    <div className="border shadow rounded max-w-md w-full p-4 grid gap-5 bg-white">
      <h1 className="text-center font-bold text-2xl">Alarm Clock</h1>
      <div className="grid place-items-center gap-3">
        <div className={`mx-auto max-w-[50px] w-full ${animIcon ? 'animate-bounce' : ''}`}>
          <PiBellSimpleRingingDuotone size={50} />
        </div>
        <p className="font-bold text-2xl text-center md:text-4xl">{timeString}</p>
        <div className="grid gap-3 w-full sm:grid-cols-3">
          <SelectField
            value={selectedHour}
            onChange={handleSelectChange(setSelectedHour)}
            disabled={isAlarmSet}
            options={generateFormattedTime(12)}
            defaultOption="Hour"
          />
          <SelectField
            value={selectedMinute}
            onChange={handleSelectChange(setSelectedMinute)}
            disabled={isAlarmSet}
            options={generateFormattedTime(60)}
            defaultOption="Minute"
          />
          <SelectField
            value={selectedPeriod}
            onChange={handleSelectChange(setSelectedPeriod)}
            disabled={isAlarmSet}
            options={['AM', 'PM']}
            defaultOption="AM/PM"
          />
        </div>
        <Button onClick={handleSetAlarmClick} fullWidth={true}>
          {buttonText}
        </Button>
      </div>
    </div>
  );
}

export default Root;
