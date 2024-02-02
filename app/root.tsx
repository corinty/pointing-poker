import {cssBundleHref} from '@remix-run/css-bundle';
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
import {User, userRepository} from './db/users';
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
  const location = useLocation();

  const loginRequired = !!location.state?.loginRequired;

  useEffect(() => {
    getAuth().onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        const user = userRepository.fromFirebaseToUser(firebaseUser);
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
        {loginRequired && (
          <div className="flex justify-center">
            <p className="notice w-1/2 text-center">Please sign in</p>
          </div>
        )}
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
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
