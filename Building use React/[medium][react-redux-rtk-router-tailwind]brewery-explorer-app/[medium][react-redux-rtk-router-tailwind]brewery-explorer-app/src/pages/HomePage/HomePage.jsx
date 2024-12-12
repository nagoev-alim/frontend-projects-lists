import BreweryList from '@pages/HomePage/BreweryList.jsx';
import BreweryControls from '@pages/HomePage/BreweryControls.jsx';

const HomePage = () => (
  <div className="grid gap-4">
    {/* Компонент с элементами управления (например, поиск, фильтрация) */}
    <BreweryControls />
    {/* Компонент, отображающий список пивоварен */}
    <BreweryList />
  </div>
);


export default HomePage;
