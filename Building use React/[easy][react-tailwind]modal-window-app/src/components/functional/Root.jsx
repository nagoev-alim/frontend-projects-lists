'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ModalContent, ModalOverlay } from '@functional';
import { Button } from '@ui';

/**
 * @module Root
 * @description Компонент модального окна, который может быть открыт и закрыт пользователем.
 * Поддерживает закрытие по клику вне окна, нажатию на кнопку закрытия или клавишу Escape.
 * @returns {JSX.Element} Возвращает JSX элемент, представляющий модальное окно и кнопку для его открытия.
 */
function Root() {
  // Состояние открытия/закрытия модального окна
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Ссылка на DOM элемент модального окна
  const modalRef = useRef(null);

  /**
   * @function handleToggleModal
   * Переключает состояние модального окна между открытым и закрытым.
   */
  const handleToggleModal = useCallback(() => {
    setIsModalOpen(prevState => !prevState);
  }, []);

  /**
   * @function handleOverlayClick
   * Обрабатывает клик по оверлею модального окна.
   * @description
   * Эта функция проверяет, был ли клик выполнен вне содержимого модального окна.
   * Если клик был вне модального окна, вызывается функция handleToggleModal для закрытия окна.
   * Функция использует useCallback для оптимизации производительности.
   */
  const handleOverlayClick = useCallback((e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      handleToggleModal();
    }
  }, [handleToggleModal]);

  /**
   * @function escapeKeyEffect
   * Эффект для обработки нажатия клавиши Escape для закрытия модального окна.
   * @description
   * Этот эффект добавляет обработчик события keydown для всего документа.
   * Если нажата клавиша Escape и модальное окно открыто, оно закрывается.
   * Обработчик удаляется при размонтировании компонента или изменении зависимостей.
   */
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && isModalOpen) handleToggleModal();
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [isModalOpen, handleToggleModal]);

  return (
    <div className="bg-white border shadow rounded max-w-md w-full p-3 grid gap-4">
      <h1 className="text-center font-bold text-2xl">Modal Window</h1>
      <Button onClick={handleToggleModal}>Open Modal</Button>
      {isModalOpen && (
        <ModalOverlay onClose={handleOverlayClick}>
          <ModalContent onClose={handleToggleModal} ref={modalRef}>
            <h2 className="text-2xl font-bold">Title</h2>
            <p>
              &ldquo;It&apos;s only after we&apos;ve lost everything that we&apos;re free to do anything.&rdquo; ―
              Chuck Palahniuk, Fight Club
            </p>
            <Button variant="danger" onClick={handleToggleModal}>Close Modal</Button>
          </ModalContent>
        </ModalOverlay>
      )}
    </div>
  );
}

export default Root;
