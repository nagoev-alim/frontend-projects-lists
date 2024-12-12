import { Button, Input, Select, Textarea } from '@ui';
import { useState, useCallback } from 'react';

// Начальные данные формы.
const INITIAL_FORM_DATA = {
  content: 'It\'s Only After We\'ve Lost Everything That We\'re Free To Do Anything.',
  filetype: '',
  filename: '',
};

// Опции типов файлов для выбора.
const FILE_TYPE_OPTIONS = [
  { value: 'text/plain', label: 'Text File (.txt)' },
  { value: 'text/javascript', label: 'JS File (.js)' },
  { value: 'text/html', label: 'HTML File (.html)' },
  { value: 'image/svg+xml', label: 'SVG File (.svg)' },
  { value: 'application/msword', label: 'Doc File (.doc)' },
];

/**
 * Корневой компонент приложения для сохранения текста в файл.
 * @returns {JSX.Element} Корневой компонент.
 */
const Root = () => {
  // Состояние данных формы.
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  // Состояние текста кнопки.
  const [buttonText, setButtonText] = useState('Save As Text File');

  /**
   * Обработчик изменения данных формы.
   * @param {Event} event - Событие изменения.
   */
  const handleFormDataChange = useCallback((event) => {
    const { name, value } = event.target;
    // Изменяем текст кнопки в зависимости от выбранного типа файла
    if (name === 'filetype') {
      setButtonText(`Save As ${FILE_TYPE_OPTIONS.find(({ value: file }) => value === file)?.label}`);
    }
    // Обновляем состояние формы
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  }, []);

  /**
   * Функция для скачивания файла.
   * @param {string} url - URL файла для скачивания.
   * @param {string} fileName - Имя файла.
   */
  const downloadFile = useCallback((url, fileName) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
  }, []);

  /**
   * Обработчик нажатия на кнопку сохранения.
   */
  const handleSaveClick = useCallback(() => {
    const { content, filetype, filename } = formData;
    // Создаем Blob из содержимого
    const blob = new Blob([content], { type: filetype });
    const url = URL.createObjectURL(blob);

    // Скачиваем файл
    downloadFile(url, filename || 'untitled');
    // Освобождаем ресурсы
    URL.revokeObjectURL(url);
  }, [formData, downloadFile]);

  return (
    <div className="grid max-w-md gap-4 rounded border bg-white p-3 shadow w-full">
      <h1 className="text-center font-bold text-2xl">Save Text As File</h1>
      <Textarea
        className="min-h-[150px]"
        resizeNone={true}
        fullWidth={true}
        spellCheck="false"
        placeholder="Enter something to save"
        name="content"
        value={formData.content}
        onChange={handleFormDataChange}
      />
      <div className="grid grid-cols-2 gap-3">
        <label>
          <span className="text-sm font-medium">File name</span>
          <Input
            fullWidth={true}
            name="filename"
            value={formData.filename}
            onChange={handleFormDataChange}
            placeholder="Enter file name"
          />
        </label>
        <label>
          <span className="text-sm font-medium">Save as</span>
          <Select
            name="filetype"
            value={formData.filetype}
            onChange={handleFormDataChange}
            fullWidth={true}
            options={FILE_TYPE_OPTIONS}
          />
        </label>
      </div>
      <Button onClick={handleSaveClick}>{buttonText}</Button>
    </div>
  );
};

export default Root;
