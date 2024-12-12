import { createSlice } from '@reduxjs/toolkit';
import { CONFIG_FEATURES, createSliceCase, quizActions } from '@features';

const quizSlice = createSlice({
  name: CONFIG_FEATURES.SLICES.QUIZ.NAME,
  initialState: { ...CONFIG_FEATURES.SLICES.QUIZ.INITIAL_STATE, ...CONFIG_FEATURES.REQUEST },
  reducers: {
    incrementScore(state) {
      state.data.score += 1;
    },
    nextQuestion(state) {
      if (state.data.currentQuestionIndex + 1 < state.data.questions.length) {
        state.data.currentQuestionIndex += 1;
      } else {
        state.data.quizCompleted = true;
      }
    },
    resetQuiz(state) {
      state.data.currentQuestionIndex = 0;
      state.data.score = 0;
      state.data.quizCompleted = false;
    },
  },
  extraReducers: (builder) => {
    createSliceCase(builder, quizActions.fetch, (data, payload) => {
      data.questions = payload.questions;
      data.settings = payload.settings;
    });
  },
});

const quizReducer = quizSlice.reducer;
export const {
  incrementScore,
  nextQuestion,
  resetQuiz,
} = quizSlice.actions;
export default quizReducer;
