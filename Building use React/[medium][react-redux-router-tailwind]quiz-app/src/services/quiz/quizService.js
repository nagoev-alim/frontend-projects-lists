import { API } from '@services';

const quizService = {
  fetch: async ({ amount, category, difficulty, type }) => {
    try {
      const params = new URLSearchParams({
        amount,
        category,
        difficulty,
        type,
        encode: 'url3986',
      });
      const { data: { results: questions } } = await API.get(`?${params}`);

      if (questions.length === 0) {
        throw new Error('No questions found matching the provided criteria');
      }

      return {
        questions,
        settings: { amount, category, difficulty, type },
      };
    } catch (error) {
      console.error('Error fetching data:', error);
      throw new Error(error.message || 'An unknown error occurred');
    }
  },
};

export default quizService;
