import { IoClose } from 'react-icons/io5';
import { Button } from '@ui';

/**
 * Компонент модального окна для отображения информации о покемоне.
 *
 * @param {Object} props - Свойства компонента.
 * @param {Object} props.pokemonData - Данные о покемоне.
 * @param {React.RefObject} props.modalRef - Ссылка на DOM-элемент модального окна.
 * @param {Function} props.handleOverlayClick - Функция обработки клика по оверлею.
 * @param {Function} props.onClose - Функция закрытия модального окна.
 * @returns {JSX.Element} Модальное окно с информацией о покемоне.
 */
const PokemonModal = ({ pokemonData, modalRef, handleOverlayClick, onClose }) => (
  // Оверлей модального окна
  <div className="fixed inset-0 bg-neutral-900/50 grid place-items-center p-3" onClick={handleOverlayClick}>
    {/* Контейнер содержимого модального окна */}
    <section className="bg-white p-4 rounded max-w-md relative grid gap-4" ref={modalRef}>
      {/* Кнопка закрытия модального окна */}
      <button className="absolute top-2 right-2" onClick={onClose} aria-label="Close">
        <IoClose className="text-2xl" />
      </button>
      {/* Название покемона */}
      <h2 className="text-2xl font-bold">{pokemonData?.names[7]?.name}</h2>
      {/* Изображение покемона */}
      <img className="mx-auto"
           src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonData?.pokemonId}.png`}
           alt={pokemonData?.name} />
      {/* Информация о поколении покемона */}
      <p className="grid grid-cols-2">
        <span className="p-2 border font-bold bg-gray-100">Generation:</span>
        <span className="p-2 border">{pokemonData?.name}</span>
      </p>
      {/* Эффект покемона */}
      <p className="grid grid-cols-2">
        <span className="p-2 border font-bold bg-gray-100">Effect:</span>
        <span className="p-2 border">{pokemonData?.effect_entries[1]?.short_effect}</span>
      </p>
      {/* Способность покемона */}
      <p className="grid grid-cols-2">
        <span className="p-2 border font-bold bg-gray-100">Ability:</span>
        <span className="p-2 border">{pokemonData?.flavor_text_entries[0]?.flavor_text}</span>
      </p>
      {/* Кнопка закрытия модального окна */}
      <Button variant="danger" onClick={onClose}>Close Modal</Button>
    </section>
  </div>
);

export default PokemonModal;
