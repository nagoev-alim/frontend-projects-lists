/**
 * @module LANG
 * @description Модуль, содержащий константы с текстовыми строками на английском языке для интерфейса приложения GitHub User Search.
 */
const LANG = {
  breweryList: {
    title: 'List of Breweries:',
    error: 'Error fetching breweries. Please try again later.',
    noResults: 'No breweries found matching the current search criteria.',
    type: 'Type:',
    address: 'Address:',
    city: 'City:',
    country: 'Country:',
    phone: 'Phone:',
    website: 'Website:',
    websiteLink: 'Website',
  },
  singlePage: {
    goBack: 'Go Back',
    errorMessage: 'Error fetching brewery. Please try again later.',
    breweryType: 'brewery',
  },
  header: {
    title: 'OpenBreweryDB',
  },
  controls: {
    title: 'Search or Filter:',
    searchQueryLabel: 'Search by query:',
    searchQueryPlaceholder: 'Search for a query...',
    searchCountryLabel: 'Search by country:',
    searchCountryPlaceholder: 'Select Country',
    filterLabel: 'Filter by (name, address, country, city):',
    filterPlaceholder: 'Filter by (name, address, country, city)',
    searchButton: 'Search',
    resetButton: 'Reset Search',
    errorMessage: 'Please enter a search query or select a country.',
  },
  actions: {
    fetchBreweryFailed: 'Failed to fetch brewery. Please try again later.',
    occurred: 'An error occurred:',
  },
};

export default LANG;
