import { useCallback } from 'react';
import axios from 'axios';
import { showToast } from '@utils';

const PokemonCard = ({ constants, id, name, pokemonId, type, color, onClick, setPokemonStore }) => {
  const handlePokemonCardClick = useCallback(async (id) => {
    try {
      const { data } = await axios.get(`https://pokeapi.co/api/v2/ability/${id}`);
      const { effect_entries, flavor_text_entries, names, generation: { name } } = data;
      setPokemonStore(prevState => ({
        ...prevState,
        selectedPokemon: { effect_entries, flavor_text_entries, names, name, pokemonId: id },
      }));
      onClick();
    } catch (error) {
      console.error('An error occurred:', error);
      showToast('Failed to fetch pokemon details.', 'error');
    }
  }, [id, onClick, setPokemonStore]);

  return (
    <li className="border rounded-lg overflow-hidden min-h-[248px]">
      <div className="flex justify-center items-center p-2" style={{
        backgroundColor: color,
      }}>
        <img src={`${constants.spritesUrl}/${id}.png`} alt={name} />
      </div>
      <div className="bg-white grid gap-2 place-items-center p-3 cursor-pointer"
           onClick={() => handlePokemonCardClick(id)}>
        <span className="rounded-xl bg-neutral-500 p-1.5 font-medium text-white">#{pokemonId}</span>
        <h3 className="h5">{name}</h3>
        <div className="flex"><p className="font-bold">Type</p>: {type}</div>
      </div>
    </li>
  );
};

export default PokemonCard;
