import { cacheExchange } from '@urql/exchange-graphcache';
import React from  'react';
import { Client, Provider, fetchExchange } from 'urql';
import { ROOT_QUERY } from './App';

const makeClient = () => new Client({
  url: 'http://localhost:4000/graphql',
  exchanges: [
    cacheExchange({
      updates: {
        Mutation: {
          addFakeUsers(result, _args, cache, _info) {
            cache.updateQuery({ query: ROOT_QUERY }, data => {
              return {
                ...data,
                totalUsers: data.totalUsers + result.addFakeUsers.length,
                allUsers: [...data.allUsers, ...result.addFakeUsers],
              };
            });
          }
        }
      },
      keys: {
        User: data => data.githubLogin
      }
    }),
    fetchExchange,
  ],
  requestPolicy: 'cache-first',
  fetchOptions: () => ({
    headers: {
      authorization: localStorage.getItem('token'),
    }
  })
});

const UrlClientContext = React.createContext({
  resetClient: () => void 0
});

export function UrqlClientProvider({ children }) {
  const [client, setClient] = React.useState(makeClient());

  return (
    <UrlClientContext.Provider value={{
      resetClient: () => setClient(makeClient())
    }}>
      <Provider value={client}>
        { children }
      </Provider>
    </UrlClientContext.Provider>
  );
}

export function useClient() {
  return React.useContext(UrlClientContext);
}