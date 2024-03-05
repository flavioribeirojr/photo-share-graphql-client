import { gql } from 'urql';
import { Users } from './Users';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { UserAuthorization } from './UserAuthorization';
import { UrqlClientProvider } from './urql-client';

export const ROOT_QUERY = gql`
  query allUsers {
    totalUsers
    allUsers { ...userInfo }
    me { ...userInfo }
  }

  fragment userInfo on User {
    githubLogin
    name
    avatar
  }
`;

const router = createBrowserRouter([
  {
    path: '/',
    Component: Users,
  },
  {
    path: '/authorization',
    Component: UserAuthorization,
  }
]);

function App() {
  return (
    <UrqlClientProvider>
      <RouterProvider router={router} />
    </UrqlClientProvider>
  );
}

export default App;
