import './index.css';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import { Head, Root } from '@functional';

createRoot(document.getElementById('root')).render(
  <div className="min-h-screen w-full grid place-items-start p-2 bg-neutral-100">
    <Head
      description="Explore the world of Pokémon with our interactive Pokedex app"
      title="Pokedex App"
      keywords="pokemon, pokedex, creatures, game, collection"
    />
    <Root />
    <Toaster />
  </div>,
);
