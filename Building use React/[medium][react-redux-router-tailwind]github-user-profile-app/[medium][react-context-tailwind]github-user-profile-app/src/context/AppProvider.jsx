import { useCallback, useReducer } from 'react';
import axios from 'axios';
import { showToast } from '../utils/index.js';
import { AppReducer, AppContext } from './index.js';
import PropTypes from 'prop-types';

const API = {
  BASE_URL: 'https://api.github.com',
  REPOS_PER_PAGE: 10,
};

const initialState = {
  fetchingStatus: { loading: false, error: false },
  profileData: null,
};

const formatUserData = (userData) => ({
  login: userData.login,
  html_url: userData.html_url,
  avatar_url: userData.avatar_url,
  followers: userData.followers,
  following: userData.following,
  public_gists: userData.public_gists,
  public_repos: userData.public_repos,
  bio: userData.bio,
});

const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(AppReducer, initialState);

  const fetchProfileData = useCallback(async (query) => {
    dispatch({ type: 'SET_FETCHING_STATUS', payload: { loading: true, error: false } });

    try {
      const [userResponse, reposResponse] = await Promise.all([
        axios.get(`${API.BASE_URL}/users/${query}`),
        axios.get(`${API.BASE_URL}/users/${query}/repos`, {
          params: { sort: 'created', per_page: API.REPOS_PER_PAGE },
        }),
      ]);

      if (userResponse.status !== 200 || reposResponse.status !== 200) {
        throw new Error(`HTTP error! status: ${userResponse.status}, ${reposResponse.status}`);
      }

      const { data: userData } = userResponse;
      const { data: reposData } = reposResponse;

      if (!userData || !reposData) {
        throw new Error('Received empty data from GitHub API');
      }

      const formattedUserData = formatUserData(userData);

      dispatch({
        type: 'SET_PROFILE_DATA',
        payload: {
          user: formattedUserData,
          repos: reposData,
        },
      });

      dispatch({
        type: 'SET_FETCHING_STATUS',
        payload: { loading: false, error: false },
      });

      showToast('Profile data fetched successfully', 'success');
    } catch (error) {
      let errorMessage = 'Error fetching GitHub profile data. Please try again later.';
      if (error.status === 404) {
        errorMessage = 'User not found. Please check the username and try again.';
      }
      showToast(errorMessage, 'error');
      dispatch({
        type: 'SET_FETCHING_STATUS',
        payload: { loading: false, error: errorMessage },
      });
      dispatch({
        type: 'SET_PROFILE_DATA',
        payload: null,
      });
    }
  }, []);

  const values = {
    fetchingStatus: state.fetchingStatus,
    profileData: state.profileData,
    fetchProfileData,
    dispatch,
  };

  return (
    <AppContext.Provider value={values}>
      {children}
    </AppContext.Provider>
  );
};

AppProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AppProvider;
