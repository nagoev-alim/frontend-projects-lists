const CONFIG_FEATURES = {
  // SLICES
  SLICES: {
    QUIZ: {
      NAME: 'quiz',
      INITIAL_STATE: {
        data: {
          questions: [],
          currentQuestionIndex: 0,
          score: 0,
          quizCompleted: false,
          settings: {
            amount: 10,
            category: '',
            difficulty: '',
            type: '',
          },
        },
      },
      ACTIONS: {
        FETCH: 'quiz/FETCH',
      },
    },
  },

  // REQUEST
  REQUEST: {
    request: {
      status: 'idle',
      error: null,
      message: null,
    },
  },

  // SLICE_CASE_TYPE
  SLICE_CASE_TYPE: {
    PENDING: (state) => {
      state.request.status = 'loading';
      state.request.message = '';
      state.request.error = null;
    },
    FULFILLED: (state, action, updateData) => {
      state.request.status = 'success';
      state.request.message = '';
      state.request.error = null;
      updateData(state.data, action.payload);
    },
    REJECTED: (state, action) => {
      state.request.status = 'failed';
      state.request.error = true;
      state.request.message = action.error.message;
    },
  },

  QUIZ_TYPES: [
    { value: 'any', label: 'Any Type' },
    { value: 'multiple', label: 'Multiple-choice' },
    { value: 'boolean', label: 'True/False' },
  ],

  DIFFICULTY_LEVELS: [
    { value: 'any', label: 'Any Difficulty' },
    { value: 'easy', label: 'Easy' },
    { value: 'medium', label: 'Medium' },
    { value: 'hard', label: 'Hard' },
  ],

  CATEGORIES: [
    { value: 'any', label: 'Any Category' },
    { value: '9', label: 'General Knowledge' },
    { value: '10', label: 'Entertainment: Books' },
    { value: '11', label: 'Entertainment: Film' },
    { value: '12', label: 'Entertainment: Music' },
    { value: '13', label: 'Entertainment: Musicals & Theatres' },
    { value: '14', label: 'Entertainment: Television' },
    { value: '15', label: 'Entertainment: Video Games' },
    { value: '16', label: 'Entertainment: Board Games' },
    { value: '17', label: 'Science & Nature' },
    { value: '18', label: 'Science: Computers' },
    { value: '19', label: 'Science: Mathematics' },
    { value: '20', label: 'Mythology' },
    { value: '21', label: 'Sports' },
    { value: '22', label: 'Geography' },
    { value: '23', label: 'History' },
    { value: '24', label: 'Politics' },
    { value: '25', label: 'Art' },
    { value: '26', label: 'Celebrities' },
    { value: '27', label: 'Animals' },
    { value: '28', label: 'Vehicles' },
    { value: '29', label: 'Entertainment: Comics' },
    { value: '30', label: 'Science: Gadgets' },
    { value: '31', label: 'Entertainment: Japanese Anime & Manga' },
    { value: '32', label: 'Entertainment: Cartoon & Animations' },
  ],
};

export default CONFIG_FEATURES;
