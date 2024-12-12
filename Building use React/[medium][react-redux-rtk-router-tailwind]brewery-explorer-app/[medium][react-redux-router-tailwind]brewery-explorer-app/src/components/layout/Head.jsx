import { Helmet, HelmetProvider } from 'react-helmet-async';
import PropTypes from 'prop-types';

/**
 * Компонент Head для управления метаданными страницы.
 * @component
 * @param {Object} props - Свойства компонента.
 * @param {string} props.description - Описание страницы для мета-тега description.
 * @param {string} props.title - Заголовок страницы, используемый для тега title и мета-тега og:title.
 * @param {string} props.keywords - Ключевые слова страницы, используемые для тега meta-keywords и Open Graph заголовка.
 *
 * @returns {JSX.Element} Возвращает компонент Helmet с настроенными метаданными.
 *
 * @description
 * Этот компонент использует react-helmet-async для управления содержимым тега <head>.
 * Он устанавливает заголовок страницы, мета-описание и Open Graph заголовок.
 * Это полезно для SEO и правильного отображения при шеринге в социальных сетях.
 */
const Head = ({ description, title, keywords }) => (
  <HelmetProvider>
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta name="keywords" content={keywords} />
    </Helmet>
  </HelmetProvider>
);

Head.propTypes = {
  description: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  keywords: PropTypes.string.isRequired,
};

export default Head;
