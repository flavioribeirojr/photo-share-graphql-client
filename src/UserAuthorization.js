import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { gql, useMutation, useQuery } from "urql";
import { ROOT_QUERY } from "./App";
import { useClient } from "./urql-client";

const GITHUB_AUTH_MUTATION = gql`
  mutation githubAuth($code: String!) {
    githubAuth(code: $code) { token }
  }
`;

export function UserAuthorization() {
  const [ isSigningIn, setIsSigninIn ] = useState(false);
  const [ searchParams, setSearchParams ] = useSearchParams();
  const { resetClient } = useClient();
  const navigate = useNavigate();
  const [, githubAuth] = useMutation(GITHUB_AUTH_MUTATION);

  const handleAuthorization = useCallback(async function () {
    if (isSigningIn) {
      return;
    }

    const code = searchParams.get('code');

    if (!code) {
      return;
    }

    setSearchParams({});
    setIsSigninIn(true);

    try {
      const { data } = await githubAuth({ code });
      localStorage.setItem('token', data.githubAuth.token);

      navigate('/');
    } catch (err) {
      alert('Signin failed. check console');
      console.error(err);
    } finally {
      setIsSigninIn(false);
    }
  }, [ isSigningIn, searchParams, setIsSigninIn, githubAuth, setSearchParams, navigate ]);

  useEffect(() => {
    handleAuthorization();
  }, [handleAuthorization]);

  function requestCode() {
    const clientID = 'c035974cdff1c72d3188';
    window.location = `https://github.com/login/oauth/authorize?client_id=${clientID}&scope=user`;
  }

  function logout() {
    localStorage.removeItem('token');
    resetClient();
  }

  return (
    <div>
      <div style={{ marginBottom: 10 }}>
        <Link to='/'>Home</Link>
      </div>
      <Me
        logout={logout}
        requestCode={requestCode}
        isSigningIn={isSigningIn}
      />
    </div>
  );
}

function Me({ logout, requestCode, isSigningIn }) {
  const [ result ] = useQuery({ query: ROOT_QUERY });
  const { fetching, data } = result;

  if (fetching) {
    return <p>loading...</p>;
  }

  if (data.me) {
    return <CurrentUser {...data.me} logout={logout} />;
  }

  return (
    <button disabled={isSigningIn} onClick={requestCode}>
      Sign In with Github
    </button>
  );
}

function CurrentUser({ name, avatar, logout }) {
  return (
    <div>
      <img src={avatar} width={48} height={48} alt="" />
      <h1>{name}</h1>
      <button onClick={logout}>logout</button>
    </div>
  );
}