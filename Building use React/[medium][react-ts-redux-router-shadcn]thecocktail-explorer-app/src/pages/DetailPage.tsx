import { useNavigate, useParams } from 'react-router-dom';
import { useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '../components/ui/badge';
import { drinks as drinksData } from '../mock/drinks';

const DetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const cocktail = useMemo(() => drinksData.find(drink => drink.idDrink === id), [id]);

  const handleGoBack = useCallback(() => navigate(-1), [navigate]);

  if (!cocktail) return <p className="text-red-500 dark:text-red-400">Error loading cocktail</p>;

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const ingredients = useMemo(() => {
    return Object.entries(cocktail)
      .filter(([key, value]) => key.startsWith('strIngredient') && value)
      .map(([, value]) => value);
  }, [cocktail]);

  return (
    <>
      <Button onClick={handleGoBack} className="mb-4 max-w-max">
        Go Back
      </Button>
      <Card className="p-4">
        <div
          className="grid gap-3 sm:grid-cols-2 sm:place-items-start">
          <img className="rounded-md" src={cocktail.strDrinkThumb} alt={cocktail.strDrink} />
          <div className="grid gap-3">
            <h1 className="flex flex-col items-start">
              <Badge>Name</Badge>
              <span className="text-lg font-bold">{cocktail.strDrink}</span>
            </h1>
            <div className="flex flex-col items-start">
              <Badge>Category</Badge>
              <span>{cocktail.strCategory}</span>
            </div>
            <div className="flex flex-col items-start">
              <Badge>Info</Badge>
              <span>{cocktail.strAlcoholic}</span>
            </div>
            <div className="flex flex-col items-start">
              <Badge>Glass</Badge>
              <span>{cocktail.strGlass}</span>
            </div>
            <div className="flex flex-col items-start">
              <Badge>Instructions</Badge>
              <span>{cocktail.strInstructions}</span>
            </div>
            <div className="flex flex-col items-start">
              <Badge>Ingredients</Badge>
              {ingredients.map(i => <span key={i}> - {i},</span>)}
            </div>
          </div>
        </div>
      </Card>
    </>
  );
};

export default DetailPage;
