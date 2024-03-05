import { gql, useMutation, useQuery } from 'urql';
import { ROOT_QUERY } from './App';
import { Link } from 'react-router-dom';

const ADD_FAKE_USERS_MUTATION = gql`
  mutation addFakeUsers($count: Int!) {
    addFakeUsers(count: $count) {
      githubLogin,
      name,
      avatar
    }
  }
`;

export function Users() {
  const [ result, reexecuteQuery ] = useQuery({
    query: ROOT_QUERY
  });
  const { fetching, data } = result;

  if (fetching) {
    return <p>loading users...</p>;
  }

  return (
    <UserList count={data.totalUsers} users={data.allUsers} refetchUsers={reexecuteQuery} />
  );
}

export function UserList({ count, users, refetchUsers }) {
  const [ , addFakeUsers ] = useMutation(ADD_FAKE_USERS_MUTATION);

  return (
    <div>
      <p>{count} Users</p>
      <div style={{ marginBottom: 10 }}>
        <Link to='/authorization'>Login</Link>
      </div>
      <button onClick={refetchUsers}>Refetch</button>
      <button onClick={() => addFakeUsers({ count: 1 })}>Add fake users</button>
      <ul>
      { users.map(user => (
        <UserListItem key={user.githubLogin} user={user} />
      )) }
      </ul>
    </div>
  )
}

export function UserListItem({ user }) {
  return (
    <li>
      <img src={user.avatar} width={48} height={48} alt={user.name} />
      { user.name }
    </li>
  );
}