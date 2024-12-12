import { useAxios } from '@hooks';
import { Loader } from '@ui';
import { TbCopy } from 'react-icons/tb';
import { copyToClipboard, showToast } from '@utils';
import { useCallback } from 'react';

/**
 * Компонент NumberFacts отображает факты о числах, полученные из API.
 * @returns {JSX.Element} Компонент с формой ввода числа и отображением факта.
 */
const NumberFacts = () => {
  // Используем кастомный хук useAxios для выполнения HTTP-запросов
  const { data: fact, loading, error, fetchData } = useAxios();

  /**
   * Обработчик отправки формы.
   * Проверяет введенное число и отправляет запрос к API для получения факта.
   * @param {React.FormEvent<HTMLFormElement>} e - Событие отправки формы.
   */
  const handleFormSubmit = useCallback(async (e) => {
    e.preventDefault();
    // Получаем введенное число и преобразуем его в number
    const number = Number(e.target.number.value);
    // Проверяем, является ли введенное значение положительным целым числом
    if (!(!isNaN(number) && number > 0 && Number.isInteger(number))) {
      showToast('Please enter a valid positive integer.', 'error');
      e.target.reset();
      return;
    }
    try {
      // Отправляем запрос к API для получения факта о числе
      await fetchData(`http://numbersapi.com/${number}`);
      e.target.reset();
    } catch (error) {
      showToast('Error fetching number fact. Please try again later.', 'error');
      console.error('An error occurred:', error);
    }
  }, [fetchData]);

  return (
    <div className="max-w-md w-full grid gap-2 place-items-center p-3 shadow-md bg-white rounded-md">
      <h1 className="font-bold text-2xl">Number Facts</h1>
      {/* Форма для ввода числа */}
      <form onSubmit={handleFormSubmit} className="w-full">
        <input
          className="w-full p-2.5 border-2 rounded-sm bg-neutral-100 focus:border-blue-400 focus:outline-none"
          type="number"
          name="number"
          placeholder="Enter a number"
        />
      </form>
      {/* Отображение факта о числе, если он получен */}
      {!loading && fact && (
        <div className="flex items-start gap-2">
          <span className="font-medium">{fact}</span>
          {/* Кнопка для копирования факта в буфер обмена */}
          <button
            className="flex justify-center items-center p-1 border-2 rounded-md hover:bg-neutral-100"
            onClick={() => copyToClipboard(fact)}
          >
            <TbCopy size={30} />
          </button>
        </div>
      )}
      {/* Отображение сообщения об ошибке при неудачном запросе */}
      {error && (
        <p className="text-center text-gray-500">An error occurred while fetching the number fact.</p>
      )}
      {/* Отображение индикатора загрузки */}
      {loading && (<Loader isLoading={loading} />)}
    </div>
  );
};

export default NumberFacts;
