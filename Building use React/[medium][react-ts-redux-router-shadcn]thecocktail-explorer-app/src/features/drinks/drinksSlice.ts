import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Drink } from '@mock/types';

type InitialState = {
  drinks: Drink[];
  randomDrinks: Drink[];
  searchResults: Drink[] | null;
  currentDrink: Drink | null;
}

const initialState: InitialState = {
  drinks: [],
  randomDrinks: [],
  searchResults: null,
  currentDrink: null,
};

export const drinksSlice = createSlice({
  name: 'drinks',
  initialState,
  selectors: {
    getDrinks: (state: InitialState) => state.drinks,
    getRandomDrinks: (state: InitialState) => state.randomDrinks,
    getSearchResults: (state: InitialState) => state.searchResults,
    getDrink: (state: InitialState) => (id: string) => state.drinks.find((drink: Drink) => drink.idDrink === id),
  },
  reducers: {
    setDrinks: (state, { payload }: PayloadAction<Drink[]>) => {
      state.drinks = payload;
    },
    setRandomDrinks: (state, { payload }: PayloadAction<Drink[]>) => {
      state.randomDrinks = [...payload].sort(() => 0.5 - Math.random()).slice(0, 20);
    },
    setSearchResults: (state, { payload }: PayloadAction<Drink[] | null>) => {
      state.searchResults = payload;
    },
    searchDrinks: (state, { payload }: PayloadAction<string>) => {
      const lowercaseQuery = payload.toLowerCase();
      state.searchResults = state.drinks.filter((drink: Drink) => {
        return (
          drink.strDrink.toLowerCase().includes(lowercaseQuery) ||
          drink.strCategory.toLowerCase().includes(lowercaseQuery) ||
          drink.strAlcoholic.toLowerCase().includes(lowercaseQuery) ||
          drink.strGlass.toLowerCase().includes(lowercaseQuery) ||
          (drink.strIngredient1 && drink.strIngredient1.toLowerCase().includes(lowercaseQuery)) ||
          (drink.strIngredient2 && drink.strIngredient2.toLowerCase().includes(lowercaseQuery)) ||
          (drink.strIngredient3 && drink.strIngredient3.toLowerCase().includes(lowercaseQuery)) ||
          (drink.strIngredient4 && drink.strIngredient4.toLowerCase().includes(lowercaseQuery)) ||
          (drink.strIngredient5 && drink.strIngredient5.toLowerCase().includes(lowercaseQuery))
        );
      });
    },
  },
});
