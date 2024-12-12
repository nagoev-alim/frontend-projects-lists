import axios from 'axios';

const API_BASE_URL = 'https://api.tinyurl.com/create';
const API_KEY = 'Wl2gadYaQ1kxXvyrscpipz5ThB6rg5euC0FGoPH1L5IqkLrnxALD7D0N7Hef';
const TIMEOUT = 10000;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${API_KEY}`,
  },
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

api.interceptors.response.use(handleSuccessResponse, handleErrorResponse);

const apiService = {
  fetchShorten: async (url) => {
    try {
      const {
        data: {
          data: { tiny_url },
          errors,
        },
      } = await api.post('', { url });
      console.log(tiny_url);
      return tiny_url;
    } catch (error) {
      throw error;
    }
  },

};

export default apiService;
