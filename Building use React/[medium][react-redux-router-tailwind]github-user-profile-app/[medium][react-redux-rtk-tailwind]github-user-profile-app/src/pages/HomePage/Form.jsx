import { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { showToast } from '@utils';
import { Button, Input } from '@ui';
import { clearUsers, setUsers } from '@features/githubSlice.js';
import { useLazySearchUserQuery } from '@services/github.js';

const Form = () => {
  const dispatch = useDispatch();
  const [query, setQuery] = useState('');
  const [searchUser] = useLazySearchUserQuery();

  const handleFormSubmit = useCallback(async (e) => {
    e.preventDefault();
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      showToast('Please fill the field', 'error');
      return;
    }
    await searchUser(trimmedQuery);
    setQuery('');
  }, [query, searchUser]);

  return (
    <form className="grid gap-2" onSubmit={handleFormSubmit}>
      <label>
        <Input
          type="query"
          name="search"
          fullWidth={true}
          placeholder="Search for a query"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </label>
      <Button type="submit">Search</Button>
      <Button type="button" onClick={() => dispatch(clearUsers())}>Clear Result</Button>
    </form>
  );
};

export default Form;
