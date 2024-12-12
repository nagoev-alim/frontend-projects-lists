import { PiImageSquareBold } from 'react-icons/pi';

/**
 * Компонент для загрузки изображения.
 * 
 * @param {Object} props - Свойства компонента.
 * @param {string|null} props.image - URL загруженного изображения или null, если изображение не загружено.
 * @param {React.RefObject} props.inputRef - Ссылка на input элемент для загрузки файла.
 * @param {Function} props.handleImageClick - Обработчик клика по области загрузки.
 * @param {Function} props.handleImageChange - Обработчик изменения выбранного файла.
 * @returns {JSX.Element} Компонент для загрузки изображения.
 */
const ImageUpload = ({ image, inputRef, handleImageClick, handleImageChange }) => (
  // Контейнер для области загрузки
  <div className="grid h-[250px] cursor-pointer place-items-center rounded-md border-2 border-dashed"
       onClick={handleImageClick}>
    {/* Внутренний контейнер для содержимого */}
    <div className={`relative grid w-full place-items-center gap-2 ${image ? 'h-full' : ''}`}>
      {/* Скрытый input для выбора файла */}
      <input type="file" accept="image/*" className="sr-only" onChange={handleImageChange} ref={inputRef} />
      {/* Отображение иконки, если изображение не загружено */}
      {!image && <PiImageSquareBold size={50} />}
      {/* Отображение загруженного изображения */}
      {image && <img className="absolute inset-0 h-full w-full object-contain" src={image} alt="Uploaded" />}
      {/* Текст подсказки, если изображение не загружено */}
      {!image && <p className="font-medium">Browse File to Upload</p>}
    </div>
  </div>
);

export default ImageUpload;
