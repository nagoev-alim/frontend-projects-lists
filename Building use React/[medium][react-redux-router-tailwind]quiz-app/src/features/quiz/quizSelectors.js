import { createSelector } from '@reduxjs/toolkit';

const selectState = ({ quiz }) => quiz;

const selectQuizData = createSelector(
  [selectState],
  ({
     request: {
       status,
       error,
       message,
     },
     data: {
       questions,
       currentQuestionIndex,
       score,
       quizCompleted,
       settings,
     },
   }) =>
    ({
      questions,
      currentQuestionIndex,
      score,
      quizCompleted,
      settings,
      status,
      error,
      message,
    }),
);

const quizSelectors = {
  selectQuizData,
};

export default quizSelectors;
