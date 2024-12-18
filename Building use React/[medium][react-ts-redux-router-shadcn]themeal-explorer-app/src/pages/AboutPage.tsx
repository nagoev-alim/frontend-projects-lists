import { Card } from '@/components/ui/card.tsx';

const AboutPage = () => {
  return (
    <Card className="p-4 text-center">
      <h1 className="text-lg md:text-2xl font-semibold mb-1">
        About Meal Explorer
      </h1>
      <p className="mb-1">
        Welcome to Meal Explorer - your personal guide to the world of culinary delights!
      </p>
      <p className="mb-1">
        Our app provides an extensive database of meals from around the globe. With Meal Explorer, you can:
      </p>
      <ul className="list-disc list-inside mb-1 text-left">
        <li>Search for meals by name or ingredients</li>
        <li>View detailed recipes and preparation instructions</li>
        <li>Discover new dishes with our random meal feature</li>
        <li>Learn interesting facts about the origin and history of various cuisines</li>
      </ul>
      <p>
        Whether you're a professional chef or just a food enthusiast,
        Meal Explorer will help you expand your culinary knowledge and skills.
      </p>
    </Card>
  );
};

AboutPage.displayName = 'AboutPage';

export default AboutPage;
