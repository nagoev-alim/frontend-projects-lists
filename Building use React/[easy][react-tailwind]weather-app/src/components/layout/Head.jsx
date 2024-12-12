import { Helmet, HelmetProvider } from 'react-helmet-async';
import PropTypes from 'prop-types';

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
