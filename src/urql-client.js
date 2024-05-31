import { cacheExchange } from '@urql/exchange-graphcache';
import React from  'react';
import { Client, Provider, fetchExchange, subscriptionExchange } from 'urql';
import { ROOT_QUERY } from './App';
import { createClient as createWSClient } from 'graphql-ws';

const wsClient = createWSClient({
  url: 'ws://localhost:4000/graphql',
  connectionParams: () => ({
    Authorization: localStorage.getItem('token'),
  })
});

const makeClient = () => new Client({
  url: 'http://localhost:4000/graphql',
  exchanges: [
    cacheExchange({
      updates: {
        Subscription: {
          newUser(result, _args, cache) {
            cache.updateQuery({ query: ROOT_QUERY }, data => {
              return {
                ...data,
                totalUsers: data.totalUsers + 1,
                allUsers: [...data.allUsers, result.newUser],
              }
            });
          }
        }
      },
      keys: {
        User: data => data.githubLogin
      }
    }),
    fetchExchange,
    subscriptionExchange({
      forwardSubscription(request) {
        const input = { ...request, query: request.query || '' };
        return {
          subscribe(sink) {
            const unsubscribe = wsClient.subscribe(input, sink);
            return { unsubscribe };
          },
        };
      },
    }),
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