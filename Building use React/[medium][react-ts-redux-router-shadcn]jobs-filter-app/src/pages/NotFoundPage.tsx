import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card.tsx';

const NotFoundPage = () => {
  return (
    <Card className="flex flex-col gap-2.5 p-4">
      <h1 className="text-5xl text-center font-bold">404</h1>
      <p className="flex justify-center gap-2.5">
        Ups! Page not found.
      </p>
      <Link className="flex justify-center" to="/">
        <Button>Go back to home</Button>
      </Link>
    </Card>
  );
};

NotFoundPage.displayName = 'NotFoundPage';

export default NotFoundPage;
