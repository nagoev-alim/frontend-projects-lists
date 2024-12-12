import { Link } from 'react-router-dom';
import { Terminal } from "lucide-react"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { Button } from '@/components/ui/button';

const NotFoundPage = () => (
  <Alert className='flex flex-col gap-2.5'>
    <AlertTitle className='text-5xl text-center font-bold'>
      404
    </AlertTitle>
    <AlertDescription className='flex justify-center gap-2.5'>
      <Terminal className="h-4 w-4" />
      Ups! Page not found.
    </AlertDescription>
    <Link className='flex justify-center' to="/">
      <Button>Go back to home</Button>
    </Link>
  </Alert>
);

export default NotFoundPage;
