import { useCallback } from 'react';
import { Button } from '@ui';
import { ImageUpload, ResizeControls } from '@functional';
import { useImageResize, useImageUpload } from '@hooks';
import { showToast } from '@utils';

/**
 * Корневой компонент приложения Image Resizer.
 * @component
 * @returns {JSX.Element} Возвращает JSX элемент, представляющий основной интерфейс приложения.
 */
const Root = () => {
  // Получаем состояние и методы для загрузки изображения
  const { image, inputRef, handleImageClick, handleImageChange } = useImageUpload();
  // Получаем состояние и методы для изменения размера изображения
  const { dimensions, options, handleInputChange } = useImageResize(image);

  /**
   * @function handleDownload
   * Обработчик для скачивания измененного изображения.
   */
  const handleDownload = useCallback(() => {
    if (!image) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    // Устанавливаем качество изображения в зависимости от опции уменьшения
    const imgQuality = options.reduce ? 0.6 : 1.0;

    // Устанавливаем размеры canvas согласно выбранным dimensions
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    const img = new Image();
    img.src = image;
    img.onload = () => {
      // Рисуем изображение на canvas с новыми размерами
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Создаем ссылку для скачивания
      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/jpeg', imgQuality);
      a.download = `resized_image_${Date.now()}.jpg`;
      a.click();

      // Показываем уведомление об успешном скачивании
      showToast('Image downloaded successfully', 'success');
    };
  }, [image, dimensions, options]);

  return (
    <div className="grid max-w-md gap-4 rounded border bg-white p-3 shadow w-full">
      <h1 className="text-center text-2xl font-bold">Image Resizer</h1>
      {/* Контейнер с динамической высотой в зависимости от наличия изображения */}
      <div className={`grid gap-2 transition-all ${image ? 'h-[435px] overflow-none' : 'h-[250px] overflow-hidden'}`}>
        {/* Компонент для загрузки изображения */}
        <ImageUpload
          image={image}
          inputRef={inputRef}
          handleImageClick={handleImageClick}
          handleImageChange={handleImageChange}
        />
        {/* Компонент для управления размером изображения */}
        <ResizeControls
          dimensions={dimensions}
          options={options}
          handleInputChange={handleInputChange}
        />
        {/* Кнопка для скачивания обработанного изображения */}
        <Button
          fullWidth={true}
          onClick={handleDownload}
          disabled={!image}
        >
          Download Image
        </Button>
      </div>
    </div>
  );
};

export default Root;
