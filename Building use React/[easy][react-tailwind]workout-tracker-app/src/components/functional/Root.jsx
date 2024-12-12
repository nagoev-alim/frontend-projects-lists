import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { IoMdClose } from 'react-icons/io';

/**
 * @typedef {Object} Workout
 * @property {string} id - Уникальный идентификатор тренировки
 * @property {string} date - Дата тренировки в формате YYYY-MM-DD
 * @property {string} workout - Тип тренировки
 * @property {number} duration - Продолжительность тренировки в минутах
 */

/**
 * Корневой компонент приложения для отслеживания тренировок
 * @returns {JSX.Element} Возвращает JSX разметку компонента
 */
const Root = () => {
  // Состояние для хранения списка тренировок
  const [workouts, setWorkouts] = useState([]);

  // Загрузка тренировок из localStorage при монтировании компонента
  useEffect(() => {
    const storedWorkouts = JSON.parse(localStorage.getItem('workout')) || [];
    setWorkouts(storedWorkouts);
  }, []);

  // Сохранение тренировок в localStorage при изменении состояния workouts
  useEffect(() => {
    localStorage.setItem('workout', JSON.stringify(workouts));
  }, [workouts]);

  /**
   * Добавляет новую тренировку в список
   */
  const addWorkout = () => {
    const newWorkout = {
      id: uuidv4(),
      date: new Date().toISOString().split('T')[0],
      workout: 'walking',
      duration: 30,
    };
    setWorkouts([...workouts, newWorkout]);
  };

  /**
   * Обновляет данные существующей тренировки
   * @param {string} id - Идентификатор тренировки
   * @param {string} field - Название поля для обновления
   * @param {string|number} value - Новое значение поля
   */
  const updateWorkout = (id, field, value) => {
    setWorkouts(workouts.map(workout =>
      workout.id === id ? { ...workout, [field]: value } : workout,
    ));
  };

  /**
   * Удаляет тренировку из списка
   * @param {string} id - Идентификатор тренировки для удаления
   */
  const deleteWorkout = (id) => {
    setWorkouts(workouts.filter(workout => workout.id !== id));
  };

  return (
    <div className="grid w-full max-w-2xl rounded border bg-white p-3 shadow">
      <h1 className="mb-3 text-center text-2xl font-bold md:text-4xl">Workout Tracker</h1>
      {/* Заголовок таблицы */}
      <div className="grid grid-cols-3">
        <div className="border bg-neutral-900 p-3 text-center font-medium text-white">Date</div>
        <div className="border bg-neutral-900 p-3 text-center font-medium text-white">Workout</div>
        <div className="border bg-neutral-900 p-3 text-center font-medium text-white">Duration</div>
      </div>
      {/* Список тренировок */}
      <div className="mb-3">
        {workouts.map(workout => (
          <WorkoutRow
            key={workout.id}
            workout={workout}
            updateWorkout={updateWorkout}
            deleteWorkout={deleteWorkout}
          />
        ))}
      </div>
      {/* Кнопка добавления новой тренировки */}
      <div>
        <button className="w-full border px-3 py-2 hover:bg-slate-50" onClick={addWorkout}>
          Add Entry
        </button>
      </div>
    </div>
  );
};

/**
 * Компонент для отображения одной строки тренировки
 * @param {Object} props - Свойства компонента
 * @param {Workout} props.workout - Данные о тренировке
 * @param {Function} props.updateWorkout - Функция для обновления тренировки
 * @param {Function} props.deleteWorkout - Функция для удаления тренировки
 * @returns {JSX.Element} Возвращает JSX разметку компонента
 */
const WorkoutRow = ({ workout, updateWorkout, deleteWorkout }) => {
  // Список доступных типов тренировок
  const options = ['walking', 'running', 'outdoor-cycling', 'indoor-cycling', 'swimming', 'yoga'];

  return (
    <div className="row grid grid-cols-3">
      {/* Поле для ввода даты */}
      <div className="date border p-1">
        <input
          type="date"
          value={workout.date}
          onChange={(e) => updateWorkout(workout.id, 'date', e.target.value)}
          className="px-3 py-2 border rounded w-full focus:outline-none focus:border-blue-400 bg-slate-50"
        />
      </div>
      {/* Выпадающий список для выбора типа тренировки */}
      <div className="type border p-1">
        <select
          value={workout.workout}
          onChange={(e) => updateWorkout(workout.id, 'workout', e.target.value)}
          className="px-3 py-2 border rounded w-full focus:outline-none focus:border-blue-400 bg-slate-50"
        >
          {options.map(option => (
            <option key={option} value={option}>
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </option>
          ))}
        </select>
      </div>
      {/* Поле для ввода продолжительности и кнопка удаления */}
      <div className="duration flex items-center border p-1 gap-1">
        <input
          type="number"
          value={workout.duration}
          onChange={(e) => updateWorkout(workout.id, 'duration', e.target.value)}
          className="min-w-[60px] max-w-[100px] px-3 py-2 border rounded focus:outline-none focus:border-blue-400 bg-slate-50"
        />
        <span className="text-sm">minutes</span>
        <button className="ml-auto" onClick={() => deleteWorkout(workout.id)}>
          <IoMdClose />
        </button>
      </div>
    </div>
  );
};

export default Root;
