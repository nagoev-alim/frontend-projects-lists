import { Link } from 'react-router-dom';
import { Button } from '@ui';

const NotFoundPage = () => (
  <div className="flex-grow grid place-items-center p-2">
    <div className='grid place-items-center gap-3'>
      <h1 className="text-center font-medium text-lg lg:text-3xl">Page not found</h1>
      <Link to="/">
        <Button>Go back to home page</Button>
      </Link>
    </div>
  </div>
);

export default NotFoundPage;
