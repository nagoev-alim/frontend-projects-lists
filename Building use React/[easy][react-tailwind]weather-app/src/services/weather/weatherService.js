import { weatherApi } from '..';


const weatherService = {
  searchByQuery: async (query) => {
    try {
      const { data: { current, forecast, location } } = await weatherApi.get(`${query}&days=5&aqi=no&alerts=no`);
      return {
        text: current.condition.text,
        icon: current.condition.icon,
        is_day: current.is_day,
        temp_c: current.temp_c,
        forecastday: forecast.forecastday,
        name: location.name,
        region: location.region,
        country: location.country,
      };
    } catch (error) {
      throw error;
    }
  },
};

export default weatherService;
