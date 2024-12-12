/**
 * @fileoverview Компонент для генерации QR-кодов на основе введенного текста или URL.
 * Позволяет пользователю выбирать размер QR-кода и загружать сгенерированное изображение.
 */

import { useCallback, useState } from 'react';
import { showToast } from '@utils';
import { Button, Input } from '@ui';

/**
 * Константы, используемые в компоненте Root.
 */
const CONSTANTS = {
  defaultSize: 300,
  sizeOptions: [100, 200, 300, 400, 500, 600, 700],
};


/**
 * Компонент для генерации QR-кодов.
 * @returns {JSX.Element} Возвращает JSX элемент с формой для генерации QR-кода.
 */
const Root = () => {
  // Состояние для хранения введенного пользователем текста или URL.
  const [inputText, setInputText] = useState('');
  // Состояние для хранения выбранного размера QR-кода.
  const [selectedSize, setSelectedSize] = useState(CONSTANTS.defaultSize);
  // Состояние для хранения URL сгенерированного QR-кода.
  const [qrCode, setQrCode] = useState(null);

  /**
   * Создает обработчик изменения значения ввода.
   * @description
   * Эта функция возвращает обработчик события, который:
   * 1. Извлекает тип и значение из целевого элемента события.
   * 2. Преобразует значение в число, если тип поля - 'number'.
   * 3. Вызывает переданную функцию setter с обработанным значением.
   */
  const handleInputChange = useCallback((setter) => (event) => {
    const { type, value } = event.target;
    const processedValue = type === 'number' ? Number(value) : value;
    setter(processedValue);
  }, []);

  /**
   * Обработчик отправки формы для генерации QR-кода.
   * @description
   * Эта функция выполняет следующие действия:
   * 1. Предотвращает стандартное поведение отправки формы.
   * 2. Проверяет, не пустой ли введенный текст.
   * 3. Если текст пустой, показывает сообщение об ошибке.
   * 4. Сбрасывает текущий QR-код (если есть).
   * 5. Генерирует новый URL для QR-кода на основе введенного текста и выбранного размера.
   *
   * @throws {Error} Может выбросить исключение, если APP_UTILS.showToast не определен.
   */
  const handleFormSubmit = useCallback((e) => {
    e.preventDefault();
    if (!inputText.trim()) {
      showToast('Please enter a valid text or URL', 'error');
      return;
    }
    setQrCode(null);
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${selectedSize}x${selectedSize}&data=${encodeURIComponent(inputText)}`;
    setQrCode(qrCodeUrl);
  }, [inputText, selectedSize]);

  /**
   * Обработчик для скачивания сгенерированного QR-кода.
   * @description
   * Эта функция выполняет следующие действия:
   * 1. Проверяет наличие сгенерированного QR-кода.
   * 2. Если QR-код отсутствует, показывает сообщение об ошибке.
   * 3. Загружает изображение QR-кода с сервера.
   * 4. Создает объект Blob из полученного ответа.
   * 5. Генерирует временный URL для Blob.
   * 6. Создает временный элемент <a> для скачивания.
   * 7. Инициирует скачивание файла.
   * 8. Освобождает созданный URL.
   * 9. Показывает сообщение об успешном скачивании.
   * 10. В случае ошибки показывает сообщение о неудаче.
   *
   * @throws {Error} Может выбросить исключение при проблемах с сетевым запросом или созданием Blob.
   */
  const handleDownloadClick = useCallback(async () => {
    if (!qrCode) {
      showToast('No QR code generated yet', 'error');
      return;
    }
    try {
      const response = await fetch(qrCode);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'qrcode.png';
      link.click();
      URL.revokeObjectURL(url);
      showToast('QR Code downloaded successfully', 'success');
    } catch (error) {
      console.error('Download error:', error);
      showToast('Failed to download QR Code', 'error');
    }
  }, [qrCode]);

  return (
    <div className="bg-white grid gap-2 max-w-md w-full rounded border p-3 shadow">
      <h1 className="text-center text-2xl font-bold">QR Code Generator</h1>
      <p className='text-center'>Paste a url or enter text to create QR code</p>
      <form className="grid gap-3" onSubmit={handleFormSubmit}>
        <Input
          name="text"
          placeholder="Enter text or url"
          value={inputText}
          onChange={handleInputChange(setInputText)}
        />
        <select
          className="cursor-pointer border focus:outline-none focus:ring-2 focus:ring-blue-500 px-3 py-2.5"
          name="size"
          value={selectedSize}
          onChange={handleInputChange(setSelectedSize)}
        >
          {CONSTANTS.sizeOptions.map((size) => (
            <option key={size} value={size}>{size}x{size}</option>
          ))}
        </select>
        <Button type="submit">
          Generate QR Code
        </Button>
      </form>
      {qrCode && (
        <div className="grid gap-3">
          <img
            className="mx-auto max-w-[250px] w-full"
            alt="QR Code"
            src={qrCode}
            width={selectedSize}
            height={selectedSize}
          />
          <Button onClick={handleDownloadClick}>
            Download QR Code
          </Button>
        </div>
      )}
    </div>
  );
};

export default Root;
