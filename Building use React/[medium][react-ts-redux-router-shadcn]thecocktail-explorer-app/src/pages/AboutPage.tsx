import { Card } from '@/components/ui/card.tsx';

const AboutPage = () => {
  return (
    <Card className='p-4 text-center'>
          <h1 className='text-lg md:text-2xl font-semibold mb-1'>
        About Cocktail Explorer
      </h1>
      <p className='mb-1'>
        Welcome to Cocktail Explorer - your personal guide to the world of cocktails!
      </p>
      <p className='mb-1'>
        Our app provides an extensive database of cocktails from around the globe. With Cocktail Explorer, you can:
      </p>
      <ul className='list-disc list-inside mb-1 text-left'>
        <li>Search for cocktails by name or ingredients</li>
        <li>View detailed recipes and preparation instructions</li>
        <li>Discover new drinks with our random cocktail feature</li>
        <li>Learn interesting facts about the origin and history of various cocktails</li>
      </ul>
      <p>
        Whether you're a professional bartender or just a cocktail enthusiast, 
        Cocktail Explorer will help you expand your knowledge and skills in mixology.
      </p>
    </Card>
  );
};

AboutPage.displayName = 'AboutPage';

export default AboutPage;
