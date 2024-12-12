/**
 * Получает элемент из локального хранилища (localStorage) и при необходимости извлекает конкретное поле.
 *
 * @param {string} key - Ключ, по которому производится поиск в localStorage.
 * @param {string|null} [field=null] - Поле объекта, которое нужно извлечь (если указано).
 * @returns {*|null} Возвращает значение из localStorage (или конкретное поле, если указано).
 *                   Если элемент не найден или произошла ошибка парсинга, возвращает null.
 * @throws {SyntaxError} Может выбросить исключение, если JSON.parse не сможет разобрать строку.
 */
const getLocalStorageItem = (key, field = null) => {
  try {
    const item = localStorage.getItem(key);
    if (!item) return null;

    const parsedItem = JSON.parse(item);
    return field ? parsedItem[field] : parsedItem;
  } catch (error) {
    console.error(`Error when retrieving or parsing an element from localStorage: ${error.message}`);
    return null;
  }
};

export default getLocalStorageItem;
