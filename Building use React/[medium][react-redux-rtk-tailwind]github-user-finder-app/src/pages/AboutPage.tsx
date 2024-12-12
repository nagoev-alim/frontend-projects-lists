import { Card } from '@/components/ui/card.tsx';

const AboutPage = () => {
  return (
    <Card className='p-4 text-center'>
      <h1 className='text-lg md:text-2xl font-semibold mb-1'>
        About GitHub User Finder
      </h1>
      <p>
        This is an example of a React application that fetches GitHub users and displays their information.
      </p>
    </Card>
  );
};

AboutPage.displayName = 'AboutPage';

export default AboutPage;
