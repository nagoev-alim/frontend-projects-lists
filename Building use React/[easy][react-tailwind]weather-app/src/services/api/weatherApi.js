import axios from 'axios';

const API_BASE_URL = 'https://api.weatherapi.com/v1/forecast.json?key=2260a9d16e4a45e1a44115831212511&q=';

const TIMEOUT = 10000;

const weatherApi = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: TIMEOUT,
  validateStatus: (status) => status >= 200 && status < 300,
});

const handleSuccessResponse = (response) => response;

const handleErrorResponse = (error) => {
  const errorMessage = error.response?.data?.message || error.message || 'An unknown error has occurred';
  console.error('API error:', errorMessage);
  if (error.response) {
    const errorHandlers = {
      401: () => console.log('Authentication Error'),
      403: () => console.log('Access denied'),
      404: () => console.log('Resource not found'),
      default: () => console.log('An error occurred:', error.response.status),
    };
    const handler = errorHandlers[error.response.status] || errorHandlers.default;
    handler();
  }
  return Promise.reject(errorMessage);
};

weatherApi.interceptors.response.use(handleSuccessResponse, handleErrorResponse);

export default weatherApi;
