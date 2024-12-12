import { Button, Input } from '@ui';
import { FaHashtag, FaTimes } from 'react-icons/fa';
import { useCallback, useEffect, useRef, useState } from 'react';
import { showToast } from '@utils';

// Максимальное количество тегов.
const MAX_TAGS = 10;

// Теги по умолчанию.
const DEFAULT_TAGS = ['dev', 'react'];

/**
 * Получает теги из localStorage.
 * @returns {string[]} Массив тегов из localStorage или DEFAULT_TAGS, если в localStorage ничего нет.
 */
const getTagsFromLocalStorage = () => {
  const storedTags = localStorage.getItem('tags');
  return storedTags ? JSON.parse(storedTags) : DEFAULT_TAGS;
};

/**
 * Сохраняет теги в localStorage.
 * @param {string[]} tags - Массив тегов для сохранения.
 */
const setTagsToLocalStorage = (tags) => {
  localStorage.setItem('tags', JSON.stringify(tags));
};

/**
 * Корневой компонент для управления тегами.
 * @returns {JSX.Element} Элемент React с интерфейсом управления тегами.
 */
const Root = () => {
  // Состояние для хранения тегов
  const [tags, setTags] = useState(getTagsFromLocalStorage);
  // Состояние для отслеживания оставшегося количества тегов
  const [remainingTags, setRemainingTags] = useState(MAX_TAGS - tags.length);
  // Ссылка на input для ввода новых тегов
  const inputRef = useRef(null);

  // Эффект для фокусировки на input при монтировании компонента
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Эффект для обновления remainingTags и сохранения тегов в localStorage при изменении tags
  useEffect(() => {
    setRemainingTags(MAX_TAGS - tags.length);
    setTagsToLocalStorage(tags);
  }, [tags]);

  /**
   * Обработчик нажатия клавиш для добавления тега.
   */
  const handleKeyDown = useCallback((e) => {
    if (['Enter', ','].includes(e.key)) {
      e.preventDefault();
      addTag();
    }
  }, []);

  /**
   * Добавляет новый тег в список.
   */
  const addTag = useCallback(() => {
    const newTag = inputRef.current?.value.trim();
    const isValidTag = newTag && !tags.includes(newTag) && tags.length < MAX_TAGS;

    if (isValidTag) {
      setTags(prevTags => [...prevTags, newTag]);
      inputRef.current.value = '';
    } else {
      showToast('Tag already exists or maximum limit reached!', 'error');
      inputRef.current.value = '';
    }

    inputRef.current?.focus();
  }, [tags]);

  /**
   * Удаляет указанный тег из списка.
   * @param {string} tagToRemove - Тег для удаления.
   */
  const removeTag = useCallback((tagToRemove) => {
    setTags(prevTags => prevTags.filter(tag => tag !== tagToRemove));
  }, []);

  /**
   * Удаляет все теги после подтверждения пользователем.
   */
  const removeAllTags = useCallback(() => {
    if (window.confirm('Are you sure you want to remove all tags?')) {
      setTags([]);
      showToast('All tags removed successfully!', 'success');
    }
  }, []);

  return (
    <div className="grid max-w-md w-full gap-2 rounded border bg-white p-3 shadow">
      <h1 className="flex items-center gap-1 text-2xl font-bold">
        <FaHashtag size={20} />
        <span>Tags Input Box</span>
      </h1>
      <div className="grid gap-3">
        <p>Press enter or add a comma after each tag</p>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <span
              key={index}
              onClick={() => removeTag(tag)}
              className="bg-blue-100 text-blue-800 px-2 py-1 rounded flex items-center cursor-pointer"
            >
              {tag}
              <FaTimes className="ml-2 cursor-pointer" />
            </span>
          ))}
          <Input
            ref={inputRef}
            fullWidth={true}
            spellCheck="false"
            onKeyDown={handleKeyDown}
            disabled={tags.length >= MAX_TAGS}
          />
        </div>
      </div>
      <div className="flex items-center justify-between gap-3">
        <p><span className="font-bold">{remainingTags}</span> tags are remaining</p>
        <Button onClick={removeAllTags} disabled={remainingTags === MAX_TAGS}>Remove All</Button>
      </div>
    </div>
  );
};

export default Root;
