import axios from 'axios';

const API_BASE_URL = 'https://opentdb.com/api.php';
const TIMEOUT = 10000;

const API = axios.create({
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

API.interceptors.response.use(handleSuccessResponse, handleErrorResponse);

export default API;
