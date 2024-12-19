import { Card } from '@/components/ui/card.tsx';

const AboutPage = () => {
  return (
    <Card className="p-4">
      <h1 className="text-lg md:text-2xl font-semibold mb-4">
        About Jobs Filter App
      </h1>
      <p className="mb-3">
        Welcome to our Jobs Filter Application! This app is designed to help job seekers easily find and filter through
        various job opportunities. Built with React, TypeScript, and Redux, our app offers a seamless user experience with fast and efficient job
        searching capabilities.
      </p>
      <p className='font-semibold'>
        Key features include:
      </p>
      <ul className="list-disc list-inside text-left mt-2">
        <li>Advanced filtering options</li>
        <li>Real-time updates</li>
        <li>Responsive design for all devices</li>
        <li>User-friendly interface</li>
      </ul>
    </Card>
  );
};

AboutPage.displayName = 'AboutPage';

export default AboutPage;
