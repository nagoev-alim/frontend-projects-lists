import { Card } from '@/components/ui/card.tsx';

const AboutPage = () => {
  return (
    <Card className="grid gap-3 p-4">
      <h1 className='text-lg md:text-2xl text-center font-bold mb-4'>
        About Todo App
      </h1>
      <div className='space-y-4 text-left'>
        <p>
          Welcome to our Todo App! This application is designed to help you manage your tasks efficiently and effectively.
        </p>
        <p>
          Built with React and TypeScript, our app leverages modern web technologies to provide a smooth and responsive user experience. We use Redux Toolkit Query for state management and API interactions, ensuring that your data is always up-to-date.
        </p>
        <p>
          Key features of our Todo App include:
        </p>
        <ul className='list-disc list-inside pl-4 space-y-2'>
          <li>Create, edit, and delete tasks</li>
          <li>Categorize tasks for better organization</li>
          <li>Set due dates for your tasks</li>
          <li>Color-code your tasks for visual prioritization</li>
          <li>Filter and sort tasks to find what you need quickly</li>
          <li>Responsive design that works on desktop and mobile devices</li>
        </ul>
      </div>
    </Card>
  );
};

AboutPage.displayName = 'AboutPage';

export default AboutPage;
