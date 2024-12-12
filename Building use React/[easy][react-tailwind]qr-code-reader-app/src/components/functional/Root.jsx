import { GrDocumentUpload } from 'react-icons/gr';
import { useCallback, useRef, useState } from 'react';
import axios from 'axios';
import { Toaster } from 'react-hot-toast';
import { Button, Input, Textarea } from '@ui';
import { copyToClipboard, showToast } from '@utils';

/**
 * Корневой компонент приложения для чтения QR-кодов.
 * @returns {JSX.Element} Возвращает JSX для рендеринга компонента.
 */
const Root = () => {
  // Состояние для текста сообщения
  const [messageText, setMessageText] = useState('Upload QR Code to Read');
  // Состояние для данных QR-кода
  const [qrData, setQrData] = useState(null);
  // Реф для input элемента выбора файла
  const inputFileRef = useRef(null);
  // Реф для img элемента
  const imageRef = useRef(null);

  /**
   * Обновляет UI формы QR-кода.
   * @param {File|null} file - Файл изображения QR-кода
   * @param {string|null} url - URL, полученный из QR-кода
   * @returns {boolean} Возвращает true, если QR-код успешно отсканирован
   */
  const updateQrFormUI = useCallback((file = null, url = null) => {
    const isQrCodeScanned = file && url;
    setQrData(isQrCodeScanned ? url : null);
    return isQrCodeScanned;
  }, []);

  /**
   * Получает данные из QR-кода.
   * @param {File} file - Файл изображения QR-кода
   * @param {FormData} formData - Данные формы для отправки на сервер
   * @returns {Promise<QRScanResult>} Результат сканирования QR-кода
   */
  const getQrData = useCallback(async (file, formData) => {
    setMessageText('Scanning QR Code...');
    try {
      const response = await axios.post('https://api.qrserver.com/v1/read-qr-code/', formData);
      const url = response.data[0]?.symbol[0]?.data;
      return url ? { url, file } : { error: 'Couldn\'t scan QR Code' };
    } catch (error) {
      console.error(error.message);
      return { error: 'Failed to scan QR Code' };
    } finally {
      setMessageText('Upload QR Code to Scan');
    }
  }, []);

  /**
   * Обрабатывает изменение выбранного файла.
   * @param {File} file - Выбранный файл изображения
   */
  const handleInputChange = useCallback(async (file) => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const result = await getQrData(file, formData);
      if (result.error) {
        showToast('Failed to scan QR Code', 'error');
        updateUI();
      } else {
        updateUI(result.file, result.url);
      }
    } catch (error) {
      showToast('Failed to scan QR Code', 'error');
      updateUI();
    }
  }, [getQrData]);

  /**
   * Обрабатывает изменение файла в input элементе.
   */
  const handleFileInputChange = async () => {
    const file = inputFileRef.current?.files[0];
    await handleInputChange(file);
  };

  /**
   * Обрабатывает клик по форме для открытия диалога выбора файла.
   */
  const handleFormClick = () => {
    inputFileRef.current.click();
  };

  /**
   * Обновляет пользовательский интерфейс после сканирования QR-кода.
   * @param {File} file - Файл изображения QR-кода
   * @param {string} url - URL, полученный из QR-кода
   */
  const updateUI = (file, url) => {
    const isQrCodeScanned = updateQrFormUI(file, url);
    if (isQrCodeScanned && file) {
      imageRef.current.src = URL.createObjectURL(file);
      imageRef.current.classList.remove('hidden');
    } else {
      imageRef.current.src = '#';
      imageRef.current.classList.add('hidden');
    }
    if (!isQrCodeScanned) inputFileRef.current.value = '';
  };

  return (
    <div className="grid w-full max-w-md gap-4 rounded border bg-white p-3 shadow">
      <h1 className="text-center text-2xl font-bold">QR Reader</h1>
      <div className={`grid gap-3 overflow-hidden ${qrData ? 'max-h-[420px]' : 'max-h-[200px]'}`}>
        <form
          className="min-h-[200px] p-8 cursor-pointer grid place-content-center rounded border-2 border-dashed border-black transition-all"
          onClick={handleFormClick}>
          <Input
            type="file"
            className="sr-only"
            onChange={handleFileInputChange}
            ref={inputFileRef}
          />
          <img src="#" alt="qr-code" width={190} height={190} className="object-cover hidden" ref={imageRef} />

          {!qrData && (
            <div className="grid place-items-center gap-4">
              {<GrDocumentUpload size={40} />}
              <p>{messageText}</p>
            </div>
          )}
        </form>
        <div className="grid grid-cols-2 gap-3">
          <Textarea
            resizeNone={true}
            fullWidth={true}
            className='col-span-2 min-h-[150px]'
            spellCheck="false" disabled defaultValue={qrData ?? ''} />
          <Button variant="danger" onClick={() => updateUI()}>Close</Button>
          <Button onClick={() => copyToClipboard(qrData)}>Copy</Button>
        </div>
      </div>
    </div>
  );
};

export default Root;
