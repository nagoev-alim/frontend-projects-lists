import { Card } from '@/components/ui/card.tsx';

const AboutPage = () => {
  return (
    <Card className="p-4 text-center">
      <h1 className="text-lg md:text-2xl font-semibold mb-3">
        About Our Mobile Store Cart App
      </h1>
      <p className="mb-2">
        Welcome to our Mobile Store Cart App, a modern e-commerce solution for mobile devices. This application is built using React, TypeScript, and Redux Toolkit, showcasing best practices in front-end
        development.
      </p>
      <p className="font-semibold">
        Key features include:
      </p>
      <ul className="list-disc list-inside text-left mb-2">
        <li>Responsive design for optimal viewing on all devices</li>
        <li>Real-time cart updates using Redux for state management</li>
        <li>Efficient routing with React Router</li>
        <li>Sleek UI components powered by Shadcn UI library</li>
      </ul>
      <p>
        Explore our collection and enjoy a seamless shopping experience!
      </p>
    </Card>
  );
};

AboutPage.displayName = 'AboutPage';

export default AboutPage;
