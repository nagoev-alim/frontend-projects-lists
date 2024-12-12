import { Helmet, HelmetProvider } from 'react-helmet-async';
import PropTypes from 'prop-types';

/**
 * Компонент Head для управления метаданными страницы
 * @param {Object} props - Свойства компонента
 * @param {string} props.description - Описание страницы для мета-тега description
 * @param {string} props.title - Заголовок страницы
 * @param {string} props.keywords - Ключевые слова для мета-тега keywords
 * @returns {JSX.Element} Компонент с метаданными страницы
 */
const Head = ({ description, title, keywords }) => (
  <HelmetProvider>
    <Helmet>
      {/* Заголовок страницы */}
      <title>{title}</title>
      {/* Мета-тег с описанием страницы */}
      <meta name="description" content={description} />
      {/* Мета-тег для Open Graph протокола */}
      <meta property="og:title" content={title} />
      {/* Мета-тег с ключевыми словами */}
      <meta name="keywords" content={keywords} />
    </Helmet>
  </HelmetProvider>
);

// Определение типов props с использованием PropTypes
Head.propTypes = {
  description: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  keywords: PropTypes.string.isRequired,
};

export default Head;
