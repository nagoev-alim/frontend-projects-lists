import { useGetRandomBreweryQuery } from '@services/brewery.js';
import { useSelector } from 'react-redux';
import { brewerySelectors } from '@features';
import { Loader } from '@ui';
import { Link } from 'react-router-dom';
import { SiHomebrew } from 'react-icons/si';
import { RxExternalLink } from 'react-icons/rx';

const BreweryCard = ({ brewery }) => {
  const {
    id,
    name,
    brewery_type,
    address_1,
    address_2,
    address_3,
    city,
    state_province,
    postal_code,
    country,
    phone,
    website_url,
  } = brewery;

  return (
    <article 
      className="grid gap-1.5 justify-start bg-white shadow-md rounded-lg p-4 hover:shadow-xl transition-shadow"
      aria-labelledby={`brewery-${id}`}
    >
      <h3 className="text-xl font-bold inline-flex gap-1" id={`brewery-${id}`}>
        <Link 
          className="text-xl font-bold inline-flex gap-1" 
          to={`brewery/${id}`}
          aria-label={`View details for ${name}`}
        >
          <SiHomebrew size={20} aria-hidden="true" />
          {name}
        </Link>
      </h3>
      <dl className="grid gap-1">
        <div>
          <dt className="font-bold inline">Type: </dt>
          <dd className="inline">{brewery_type}</dd>
        </div>
        <div>
          <dt className="font-bold inline">Address: </dt>
          <dd className="inline">
            {address_1}
            {address_2 && <>, {address_2}</>}
            {address_3 && <>, {address_3}</>}
          </dd>
        </div>
        <div>
          <dt className="font-bold inline">City: </dt>
          <dd className="inline">{city}, {state_province} {postal_code}</dd>
        </div>
        <div>
          <dt className="font-bold inline">Country: </dt>
          <dd className="inline">{country}</dd>
        </div>
        {phone && (
          <div>
            <dt className="font-bold inline">Phone: </dt>
            <dd className="inline">
              <a href={`tel:${phone}`} className="text-blue-600 hover:underline">
                {phone}
              </a>
            </dd>
          </div>
        )}
        {website_url && (
          <div>
            <dt className="font-bold inline">Website: </dt>
            <dd className="inline">
              <a 
                href={website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline inline-flex gap-1 items-center"
              >
                <RxExternalLink aria-hidden="true" />
                <span>Visit website</span>
              </a>
            </dd>
          </div>
        )}
      </dl>
    </article>
  );
};

const BreweryList = () => {
  const { error, loading, filteredList } = useSelector(brewerySelectors.selectAllData);
  const { isLoading } = useGetRandomBreweryQuery();

  if (isLoading || loading === 'pending') {
    return (
      <div className="flex justify-center items-center" aria-live="polite">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-center font-medium text-lg text-red-500" role="alert">
        {error}
      </p>
    );
  }

  if (filteredList.length === 0) {
    return (
      <p className="text-center font-medium text-lg" role="status">
        No breweries found matching the current search criteria.
      </p>
    );
  }

  return (
    <div className="grid gap-2">
      <h2 className="font-bold text-lg lg:text-2xl">Breweries List:</h2>
      <div 
        className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 items-start"
        role="list"
        aria-label="Breweries list"
      >
        {filteredList.map(brewery => (
          <BreweryCard key={brewery.id} brewery={brewery} />
        ))}
      </div>
    </div>
  );
};

export default BreweryList;
