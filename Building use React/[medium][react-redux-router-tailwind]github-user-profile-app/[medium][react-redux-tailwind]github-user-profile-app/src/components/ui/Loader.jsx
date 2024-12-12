import { square } from 'ldrs';
import PropTypes from 'prop-types';

square.register();


const Loader = ({ isLoading = false }) => {
 
  if (!isLoading) return null;

  return (
    <div
      className="flex justify-center"
      aria-live="polite"
      aria-busy={true}
    >
      {}
      <l-square
        size="35"
        stroke="5"
        stroke-length="0.25"
        bg-opacity="0.1"
        speed="1.2"
        color="black"
      ></l-square>
    </div>
  );
};


Loader.propTypes = {
  isLoading: PropTypes.bool,
};

export default Loader;
