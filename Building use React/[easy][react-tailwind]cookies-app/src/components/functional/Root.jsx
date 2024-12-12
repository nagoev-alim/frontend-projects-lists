import { useCallback, useEffect, useState } from 'react';
import { Button } from '@ui';

/**
 * Компонент Root отображает диалоговое окно согласия на использование cookies.
 * Он управляет состоянием принятия cookies и отображением диалога.
 *
 * @returns {React.ReactElement|null} Возвращает JSX элемент диалога или null, если cookies уже приняты.
 */
const Root = () => {
  // Состояние, указывающее, приняты ли cookies
  const [isCookieAccepted, setIsCookieAccepted] = useState(false);
  // Состояние, указывающее, закрыто ли диалоговое окно
  const [isDialogClosed, setIsDialogClosed] = useState(false);

  /**
   * Эффект для проверки наличия cookies при монтировании компонента
   */
  useEffect(() => {
    setIsCookieAccepted(document.cookie.includes('customCookies'));
  }, []);

  /**
   * Обработчик клика по кнопке "Decline"
   * Закрывает диалоговое окно без принятия cookies
   */
  const handleDeclineClick = useCallback(() => {
    setIsDialogClosed(true);
  }, []);

  /**
   * Обработчик клика по кнопке "Accept"
   * Закрывает диалоговое окно и устанавливает cookie на 30 дней
   */
  const handleAcceptClick = useCallback(() => {
    setIsDialogClosed(true);
    const thirtyDaysInSeconds = 30 * 24 * 60 * 60;
    document.cookie = `cookieBy=customCookies; max-age=${thirtyDaysInSeconds}`;
  }, []);

  // Если cookies уже приняты, не отображаем диалог
  if (isCookieAccepted) {
    return null;
  }

  return (
    <div
      className={`fixed bottom-5 left-5 grid max-w-md gap-3 rounded-lg bg-white p-3 shadow ${
        isDialogClosed ? 'hidden' : ''
      }`}
    >
      <h3 className="flex items-center gap-3 text-lg font-bold">
        <CookieIcon />
        Cookies Consent
      </h3>
      <p>
        This website uses cookies to help you have a superior and more relevant
        browsing experience on the website.
      </p>
      <a className="text-blue-600" href="#">Read more</a>
      <div className="flex items-center gap-2">
        <Button onClick={handleAcceptClick}>Accept</Button>
        <Button variant="danger" onClick={handleDeclineClick}>Decline</Button>
      </div>
    </div>
  );
};

/**
 * Компонент CookieIcon отображает SVG иконку cookie.
 *
 * @returns {React.ReactElement} Возвращает JSX элемент SVG иконки.
 */
const CookieIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" strokeWidth="1.5">
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21.8 14c-.927 4.564-4.962 8-9.8 8-5.523 0-10-4.477-10-10 0-5.185 3.947-9.449 9-9.95"
    />
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6.5 10a.5.5 0 1 1 0-1 .5.5 0 0 1 0 1ZM20.5 4a.5.5 0 1 1 0-1 .5.5 0 0 1 0 1ZM12 19a1 1 0 1 1 0-2 1 1 0 0 1 0 2ZM7 15.01l.01-.011M17 15.01l.01-.011M11 12.01l.01-.011M21 9.01l.01-.011M17 6.01l.01-.011M11 2c-.5 1.5.5 3 2.085 3C11 8.5 13 12 18 11.5c0 2.5 2.5 3 3.7 2.514"
    />
  </svg>
);

export default Root;
