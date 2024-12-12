const AppReducer = (state, action) => {
  switch (action.type) {
    case 'SET_FETCHING_STATUS':
      return { ...state, fetchingStatus: action.payload };
    case 'SET_PROFILE_DATA':
      return { ...state, profileData: action.payload };
    default:
      return state;
  }
};

export default AppReducer;
