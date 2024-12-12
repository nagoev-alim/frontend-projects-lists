import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { githubSelectors } from '@features';
import { Button, Loader } from '@ui';


const UsersList = () => {
  const {users, status, error} = useSelector(githubSelectors.selectAll)

  if (status === 'pending') {
    return <Loader />;
  }

  if (error) {
    return <p className="text-red-400 font-bold text-center">Error fetching users</p>;
  }

  if (status === 'success' && users.length === 0) {
    return <p className="text-center text-gray-500">No users found</p>;
  }
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
      {users.map(({ id, avatar_url, login }) => (
        <li
          key={id}
          className="bg-white border-2 rounded p-2 grid gap-2 dark:bg-neutral-700 dark:text-white dark:border-neutral-800"
        >
          <img className="rounded" src={avatar_url} alt={login} />
          <h3 className="font-bold uppercase text-center">{login}</h3>
          <Link to={`/user/${login}`}>
            <Button>View Detail</Button>
          </Link>
        </li>
      ))}
    </ul>
  );
};

export default UsersList;
