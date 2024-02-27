/* eslint-disable jsx-a11y/click-events-have-key-events */

import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {httpBatchLink} from '@trpc/client';
import type {AppRouter} from '~/trpc/routers/_app';
import {trpc} from '~/utils/trpc';

import {cssBundleHref} from '@remix-run/css-bundle';
import '@mantine/core/styles.css';
import '@mantine/nprogress/styles.css';
import type {LinksFunction} from '@remix-run/node';
import {
  Link,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
} from '@remix-run/react';
import {GithubAuthProvider, getAuth, signInWithPopup} from 'firebase/auth';
import {useEffect, useState} from 'react';
import simpledotcss from 'simpledotcss/simple.css';
import styles from '~/globals.css';
import animateCss from 'animate.css/animate.css';
import {User, userRepository} from './db/users';
import {UserContext} from './hooks/useCurrentUser';
import {usePresence} from './hooks/usePresence';
import {Toaster} from 'react-hot-toast';
import classNames from 'classnames';
import {ColorSchemeScript, MantineProvider} from '@mantine/core';
import {GlobalLoadingIndicator} from './components/GlobalLoadingIndicator';

export const links: LinksFunction = () => [
  {
    rel: 'stylesheet',
    href: simpledotcss,
  },
  {
    rel: 'stylesheet',
    href: styles,
  },
  {
    rel: 'stylesheet',
    href: animateCss,
  },
  ...(cssBundleHref ? [{rel: 'stylesheet', href: cssBundleHref}] : []),
];

const signIn = (setUser) => {
  const provider = new GithubAuthProvider();
  const auth = getAuth();

  signInWithPopup(auth, provider)
    .then((result) => {
      // This gives you a GitHub Access Token. You can use it to access the GitHub API.
      const credential = GithubAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;

      // The signed-in user info.
      const firebaseUser = result.user;

      console.log('Setting user to ', firebaseUser);
      setUser(userRepository.fromFirebaseToUser(firebaseUser));
      userRepository.save(firebaseUser);
    })
    .catch((error) => {
      // Handle Errors here.

      const errorCode = error.code;
      const errorMessage = error.message;
      // The email of the user's account used.
      const email = error.customData.email;
      // The AuthCredential type that was used.
      const credential = GithubAuthProvider.credentialFromError(error);
      console.log('error', error, errorCode, errorMessage, email, credential);
      // ...
    });
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: 'http://localhost:3000/trpc',
          // You can pass any HTTP headers you wish here
          async headers() {
            return {};
          },
        }),
      ],
    }),
  );

  const location = useLocation();

  const loginRequired = !!location.state?.loginRequired;

  useEffect(() => {
    getAuth().onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        const user = userRepository.fromFirebaseToUser(firebaseUser);
        location.state = null;
        setUser(user);
      }
      setLoading(false);
    });
  }, []);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <ColorSchemeScript />
      </head>
      <body>
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
          <QueryClientProvider client={queryClient}>
            <MantineProvider defaultColorScheme="dark">
              <GlobalLoadingIndicator />
              <nav className="pb-2 mt-6 border-0 border-b-2 border-solid border-slate-400">
                <div>
                  <Link to="/">Home</Link>
                </div>
                <div className="sign-in">
                  {!loading && user && user.name}
                  {!loading && !user && (
                    <button
                      type="button"
                      className={classNames('animate__animated', {
                        animate__wobble: loginRequired,
                        'bg-purple-700': loginRequired,
                        'text-white': loginRequired,
                      })}
                      onClick={() => signIn(setUser)}
                    >
                      Sign in
                    </button>
                  )}
                </div>
              </nav>
              {!loading && user && <UserProvider user={user} />}
              {!loading && !user && <Outlet />}
              {loginRequired && (
                <div className="flex justify-center">
                  <button
                    className="notice w-1/2 text-center text-white"
                    onClick={() => signIn(setUser)}
                  >
                    ⬆️ Please sign in ⬆️
                  </button>
                </div>
              )}
              <Toaster />
              <ScrollRestoration />
              <Scripts />
              <LiveReload />
            </MantineProvider>
          </QueryClientProvider>
        </trpc.Provider>
      </body>
    </html>
  );
}

function UserProvider({user}) {
  usePresence(user);
  return (
    <UserContext.Provider value={user}>
      <Outlet />
    </UserContext.Provider>
  );
}
