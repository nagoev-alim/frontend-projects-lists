import { quizService } from '@services';
import { CONFIG_FEATURES, createThunk } from '@features';

const quizActions = {
  fetch: createThunk(CONFIG_FEATURES.SLICES.QUIZ.ACTIONS.FETCH, quizService.fetch),
};

export default quizActions;
