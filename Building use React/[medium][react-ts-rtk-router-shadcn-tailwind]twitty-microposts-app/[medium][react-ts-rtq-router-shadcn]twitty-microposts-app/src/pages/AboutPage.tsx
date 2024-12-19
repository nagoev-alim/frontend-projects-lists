import { Card } from '@/components/ui/card.tsx';

const AboutPage = () => {
  return (
    <Card className='p-4'>
      <h1 className='text-lg md:text-2xl font-semibold mb-4'>
        About Twitty Microposts
      </h1>
      <p className='mb-3'>
        Twitty Microposts is a modern microblogging platform built with React and TypeScript.
        It allows users to create, read, update, and delete short posts, similar to tweets.
      </p>
      <p className='mb-3'>
        Key features:
      </p>
      <ul className='list-disc list-inside text-left mb-3'>
        <li>Create and share short posts</li>
        <li>Edit and delete your own posts</li>
        <li>Real-time updates using Redux Toolkit Query</li>
        <li>Responsive design with Tailwind CSS</li>
        <li>Modern UI components from Shadcn UI library</li>
      </ul>
      <p>
        Enjoy sharing your thoughts and connecting with others through Twitty Microposts!
      </p>
    </Card>
  );
};

AboutPage.displayName = 'AboutPage';

export default AboutPage;
