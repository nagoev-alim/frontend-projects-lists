import { useCallback, useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { debounce } from 'lodash';
import { brewerySelectors, filterBreweriesByQuery, setBreweryList } from '@features/brewerySlice.js';
import { showToast } from '@utils';
import { Button, Input, Select } from '@ui';
import {
  useGetRandomBreweryQuery,
  useLazySearchBreweryByCountryAndValueQuery,
  useLazySearchBreweryByCountryQuery,
  useLazySearchBreweryByValueQuery,
} from '@services/brewery.js';

const COUNTRIES = [
  'Austria', 'England', 'France', 'Isle of Man', 'Ireland',
  'Poland', 'Portugal', 'Scotland', 'Singapore', 'South Korea', 'United States',
];

const LABELS = {
  SEARCH_QUERY: 'Search by query:',
  SEARCH_COUNTRY: 'Search by country:',
  FILTER: 'Filter by (name, address, country, city):',
  SEARCH_BUTTON: 'Search',
  RESET_BUTTON: 'Reset Search',
  SELECT_COUNTRY: 'Select Country',
};

const BreweryControls = () => {
  const dispatch = useDispatch();
  const { breweryList: items, loading } = useSelector(brewerySelectors.selectAllData);
  const { refetch: refetchRandomBreweries } = useGetRandomBreweryQuery();
  const [searchBreweryByValue, { isLoading: isSearchLoading }] = useLazySearchBreweryByValueQuery();
  const [searchBreweryByCountry, { isLoading: isCountryLoading }] = useLazySearchBreweryByCountryQuery();
  const [searchBreweryByCountryAndValue, { isLoading: isCombinedLoading }] = useLazySearchBreweryByCountryAndValueQuery();

  const [formState, setFormState] = useState({
    search: '',
    country: '',
    filter: '',
  });

  const debouncedFilter = useMemo(
    () => debounce((query) => {
      dispatch(filterBreweriesByQuery({ items, query }));
    }, 300),
    [dispatch, items]
  );

  const handleInputChange = useCallback(({ target: { name, value } }) => {
    setFormState(prev => ({ ...prev, [name]: value }));
    if (name === 'filter') {
      debouncedFilter(value);
    }
  }, [debouncedFilter]);

  useEffect(() => {
    return () => {
      debouncedFilter.cancel();
    };
  }, [debouncedFilter]);

  const handleSearchSubmit = useCallback(async (e) => {
    e.preventDefault();
    const { search, country } = formState;
    const trimmedSearch = search.trim();
    const trimmedCountry = country.trim();

    if (!trimmedSearch && !trimmedCountry) {
      showToast('Please enter a search query or select a country.', 'error');
      return;
    }

    try {
      let result;
      if (trimmedSearch && trimmedCountry) {
        result = await searchBreweryByCountryAndValue({ country: trimmedCountry, searchValue: trimmedSearch });
      } else if (trimmedSearch) {
        result = await searchBreweryByValue(trimmedSearch);
      } else {
        result = await searchBreweryByCountry(trimmedCountry);
      }

      if (result.data) {
        dispatch(setBreweryList(result.data));
      } else if (result.error) {
        showToast(result.error.message || 'Search failed', 'error');
      }
    } catch (error) {
      showToast('An unexpected error occurred', 'error');
    }
  }, [formState, searchBreweryByValue, searchBreweryByCountry, searchBreweryByCountryAndValue, dispatch]);

  const handleResetSearch = useCallback(async () => {
    setFormState({ search: '', country: '', filter: '' });
    await refetchRandomBreweries();
  }, [refetchRandomBreweries]);

  const countryOptions = useMemo(() => [
    { value: '', label: LABELS.SELECT_COUNTRY, disabled: true },
    ...COUNTRIES.map(country => ({
      value: country,
      label: country,
    })),
  ], []);

  const isLoading = isSearchLoading || isCountryLoading || isCombinedLoading || loading === 'pending';

  return (
    <div className="grid gap-2" role="search">
      <h2 className="font-bold text-lg lg:text-2xl">Filters:</h2>
      <form className="grid gap-2" onSubmit={handleSearchSubmit} aria-label="Search breweries">
        <label htmlFor="search">
          <span className="font-medium">{LABELS.SEARCH_QUERY}</span>
          <Input
            id="search"
            type="text"
            name="search"
            fullWidth={true}
            placeholder="Search for a query..."
            value={formState.search}
            onChange={handleInputChange}
            disabled={isLoading}
            aria-label="Search query input"
          />
        </label>
        <label htmlFor="country">
          <span className="font-medium">{LABELS.SEARCH_COUNTRY}</span>
          <Select
            id="country"
            name="country"
            className="border rounded p-2 w-full cursor-pointer"
            value={formState.country}
            onChange={handleInputChange}
            options={countryOptions}
            disabled={isLoading}
            aria-label="Select country"
          />
        </label>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Searching...' : LABELS.SEARCH_BUTTON}
        </Button>
      </form>
      <label htmlFor="filter">
        <span className="font-medium">{LABELS.FILTER}</span>
        <Input
          id="filter"
          type="text"
          name="filter"
          fullWidth={true}
          placeholder="Filter by (name, address, country, city)"
          value={formState.filter}
          onChange={handleInputChange}
          disabled={isLoading}
          aria-label="Filter results"
        />
      </label>
      <Button onClick={handleResetSearch} disabled={isLoading}>
        {LABELS.RESET_BUTTON}
      </Button>
    </div>
  );
};

export default BreweryControls;
