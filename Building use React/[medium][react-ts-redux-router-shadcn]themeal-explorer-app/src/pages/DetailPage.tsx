import { useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui';
import { useSearchMealByIdQuery } from '@features/meals/mealsApi';
import { Meal } from '@features/utils/types';

const DetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: meal, isLoading, isError, isSuccess } = useSearchMealByIdQuery(id ?? '');

  const handleGoBack = useCallback(() => navigate(-1), [navigate]);

  const renderIngredients = (meal: Meal) => {
    return Object.entries(meal)
      .filter(([key, value]) => key.startsWith('strIngredient') && value)
      .map(([key, value]) => {
        const ingredientValue = typeof value === 'string' ? value :
          (typeof value === 'object' && value !== null ? JSON.stringify(value) : String(value));
        return <span key={key}> - {ingredientValue}</span>;
      });
  };

  return (
    <>
      <Button onClick={handleGoBack} className="mb-4 max-w-max">
        Go Back
      </Button>
      <Card className="p-4">
        {isError && <p className="text-red-500 dark:text-red-400">Error loading meal</p>}

        {isLoading && <Spinner />}

        {isSuccess && meal && (
          <div className="grid gap-3 sm:grid-cols-2 sm:place-items-start">
            <img className="rounded-md" src={meal.strMealThumb} alt={meal.strMeal} />
            <div className="grid gap-3">
              <h1 className="flex flex-col items-start">
                <Badge>Name</Badge>
                <span className="text-lg font-bold">{meal.strMeal}</span>
              </h1>
              <div className="flex flex-col items-start">
                <Badge>Category</Badge>
                <span>{meal.strCategory}</span>
              </div>
              <div className="flex flex-col items-start">
                <Badge>Area</Badge>
                <span>{meal.strArea}</span>
              </div>
              <div className="flex flex-col items-start">
                <Badge>Instructions</Badge>
                <span>{meal.strInstructions}</span>
              </div>
              <div className="flex flex-col items-start">
                <Badge>Ingredients</Badge>
                {renderIngredients(meal)}
              </div>
            </div>
          </div>
        )}
      </Card>
    </>
  );
};

export default DetailPage;
