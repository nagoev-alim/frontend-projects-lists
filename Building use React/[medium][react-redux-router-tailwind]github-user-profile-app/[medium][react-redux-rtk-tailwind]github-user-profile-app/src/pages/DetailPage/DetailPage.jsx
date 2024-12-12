import { useNavigate, useParams } from 'react-router-dom';
import { useCallback } from 'react';
import { Button, Loader } from '@ui';
import { FaArrowLeftLong } from 'react-icons/fa6';
import { SiHomebrew } from 'react-icons/si';
import { TbCategory } from 'react-icons/tb';
import { MdMyLocation } from 'react-icons/md';
import { FaGlobe, FaPhone } from 'react-icons/fa';

const DetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: breweryDetails, isLoading, error } = useGetBreweryByIdQuery(id);

  const handleGoBack = useCallback(() => navigate(-1), [navigate]);

  const renderBreweryDetails = () => {
    if (!breweryDetails) return null;

    const {
      name,
      brewery_type,
      street,
      city,
      state_province,
      postal_code,
      country,
      phone,
      website_url,
    } = breweryDetails;

    return (
      <div className="bg-white p-4 rounded-md shadow-md grid gap-2">
        {/* Название пивоварни */}
        <h1 className="text-3xl font-bold inline-flex gap-1">
          <SiHomebrew size={30} /> {name}
        </h1>

        {/* Тип пивоварни */}
        <p className="text-gray-600 flex gap-2 items-center">
          <TbCategory size={20} />
          {brewery_type} brewery
        </p>

        <div className="grid gap-3">
          {/* Адрес пивоварни */}
          <p className="flex items-center gap-2">
            <MdMyLocation size={20} />
            <span>
          {street}, {city}, {state_province} {postal_code}, {country}
        </span>
          </p>

          {/* Телефон пивоварни (если есть) */}
          {phone && (
            <p className="flex items-center gap-2">
              <FaPhone size={20} />
              <a href={`tel:${phone}`} className="text-blue-600 hover:underline">
                {phone}
              </a>
            </p>
          )}

          {/* Веб-сайт пивоварни (если есть) */}
          {website_url && (
            <p className="flex items-center gap-2">
              <FaGlobe size={20} />
              <a href={website_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                {website_url}
              </a>
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="grid gap-4">
      <Button className="inline-flex gap-1 items-center max-w-max" onClick={handleGoBack}>
        <FaArrowLeftLong />
        Go Back
      </Button>
      {isLoading && <Loader />}
      {error && (<p className="text-center font-medium text-lg text-red-500">
        An error occurred while fetching the brewery
      </p>)}
      {breweryDetails && renderBreweryDetails()}
    </div>
  );
};

export default DetailPage;
