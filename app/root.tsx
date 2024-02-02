import {cssBundleHref} from '@remix-run/css-bundle';
import type {ActionFunction, LinksFunction} from '@remix-run/node';
import {
  Link,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useFetcher,
} from '@remix-run/react';
import {GithubAuthProvider, getAuth, signInWithPopup} from 'firebase/auth';
import {useEffect, useState} from 'react';
import simpledotcss from 'simpledotcss/simple.css';
import styles from '~/globals.css';
import {type User, userRepository} from './db/users';
import {UserContext} from './hooks/useCurrentUser';
import {usePresence} from './hooks/usePresence';

export const links: LinksFunction = () => [
  {
    rel: 'stylesheet',
    href: styles,
  },
  {
    rel: 'stylesheet',
    href: simpledotcss,
  },
  ...(cssBundleHref ? [{rel: 'stylesheet', href: cssBundleHref}] : []),
];

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const fetcher = useFetcher();
  // useEffect(() => {
  // getAuth().onAuthStateChanged((firebaseUser) => {
  // if (firebaseUser) {
  // const user = userRepository.fromFirebaseToUser(firebaseUser);
  // setUser(user);
  // }
  // setLoading(false);
  // });
  // }, []);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <nav className="pb-2 mt-6 border-0 border-b-2 border-solid border-slate-400">
          <div>
            <Link to="/">Home</Link>
          </div>
          <div className="sign-in">
            {!loading && user && user.name}
            {!loading && !user && (
              <button type="button" onClick={() => signIn(setUser)}>
                Sign in
              </button>
            )}
          </div>
        </nav>
        {!loading && user && <UserProvider user={user} />}
        {!loading && !user && <Outlet />}
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

function UserProvider({user}: {user: User}) {
  usePresence(user);
  return (
    <UserContext.Provider value={user}>
      <Outlet />
    </UserContext.Provider>
  );
}
