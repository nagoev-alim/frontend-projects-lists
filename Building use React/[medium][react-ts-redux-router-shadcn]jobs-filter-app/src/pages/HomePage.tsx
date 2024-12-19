import { useDispatch, useSelector } from 'react-redux';
import { Card } from '@/components/ui/card';
import { positionsSlice } from '@features/positions/positionsSlice';
import { filtersSlice } from '@features/filters/filtersSlice';
import { Badge } from '@components/ui/badge';
import { Button } from '@components/ui/button';
import { AppDispatch, Job } from '@helpers/types';

const HomePage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const filters = useSelector(filtersSlice.selectors.selectFilters);
  const positions = useSelector((state) =>
    positionsSlice.selectors.selectVisiblePositions(state, filters),
  );

  const onItemClick = (filter: string) => {
    dispatch(filtersSlice.actions.addFilter(filter))
  }

  const handleDeleteFilter = (filter: string) => {
    dispatch(filtersSlice.actions.removeFilter(filter))
  }

  return (
    <Card className="p-4">

      <div className="grid gap-3">

        {filters.length > 0 && (
          <Card className="flex flex-col items-start gap-2 p-3">
            <ul className="flex flex-wrap gap-1.5">
              {filters.map((filter) => (
                <li key={filter} onClick={() => handleDeleteFilter(filter)}>
                  <Badge className="cursor-pointer">{filter}</Badge>
                </li>
              ))}
            </ul>
            <Button variant="destructive" onClick={() => dispatch(filtersSlice.actions.clearFilters())}>
              Clear all filters
            </Button>
          </Card>
        )}

        <h3 className="font-semibold text-lg">
          {positions.length} {positions.length === 1 ? 'job' : 'jobs'} found
        </h3>

        <ul className="grid gap-3">
          {positions.map(({
                            id,
                            company,
                            logo,
                            new: isNew,
                            featured,
                            position,
                            role,
                            level,
                            postedAt,
                            contract,
                            location,
                            languages,
                            tools,
                          }: Job) => {

            const badges = [].concat(role, level, ...languages, ...tools);

            return (
              <li key={id} className={`grid  ${featured ? 'card--featured' : ''}`}>
                <Card className="grid gap-3 p-3 md:grid-cols-[88px_1fr]">
                  <img src={logo} alt={company} />

                  <div className="grid gap-1.5">
                    <h3 className="font-semibold">{position}</h3>
                    <div className="grid gap-1.5">
                      <span>{company}</span>
                      <div className="flex flex-wrap gap-1.5">
                        <Badge>{contract}</Badge>
                        <Badge>{location}</Badge>
                      </div>
                    </div>

                    {(isNew || featured) &&
                      <div className="flex flex-wrap gap-1.5">
                        {isNew && <Badge variant="destructive">New</Badge>}
                        {featured && <Badge variant="outline">Featured</Badge>}
                      </div>
                    }

                    <ul className="flex flex-wrap gap-1.5">
                      {badges.map(item =>
                        <Badge className="cursor-pointer" key={item} onClick={() => onItemClick(item)}>{item}</Badge>)}
                    </ul>
                    <p>{postedAt}</p>
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>
      </div>
    </Card>
  );
};

HomePage.displayName = 'HomePage';

export default HomePage;
