import { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Button, Input } from '../ui';
import { LANG } from '../../lang';
import { showToast } from '../../utils/index.js';
import { githubActions } from '../../features/github';
import { clearUsers } from '../../features/github/githubSlice.js';

const Form = () => {
  const dispatch = useDispatch();
  const [query, setQuery] = useState('');

  const handleFormSubmit = useCallback((e) => {
    e.preventDefault();
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      showToast(LANG.form.invalidInput, 'error');
      return;
    }
    dispatch(githubActions.searchUser(trimmedQuery));
    setQuery('');
  }, [query, dispatch]);

  return (
    <form className="grid gap-2"
          onSubmit={handleFormSubmit}>
      <label>
        <Input
          type="query"
          name="search"
          className="border rounded p-3 w-full cursor-pointer dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
          placeholder={LANG.form.searchQueryPlaceholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </label>
      <Button type="submit">{LANG.form.searchButton}</Button>
      <Button type="button" onClick={()=>dispatch(clearUsers())}>{LANG.form.clearButton}</Button>
    </form>
  );
};

export default Form;
