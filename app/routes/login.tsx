import {cssBundleHref} from '@remix-run/css-bundle';
import type {ActionFunction, LinksFunction} from '@remix-run/node';
import {json, redirect} from '@remix-run/node';
import {useFetcher} from '@remix-run/react';
import {GithubAuthProvider, getAuth, signInWithPopup} from 'firebase/auth';
import {useEffect, useState} from 'react';
import {type User, userRepository} from '~/db/users';
import {authExpiry, session} from '~/cookies';
import {auth as serverAuth} from '~/db/firebase.server';
import {useSignIn} from '~/hooks/useSignIn';

export const action: ActionFunction = async ({request}) => {
  const form = await request.formData();
  console.log(form);
  const idToken = form.get('idToken')?.toString();

  if (!idToken) throw new Error('token missing');

  // Verify the idToken is actually valid
  await serverAuth.verifyIdToken(idToken);

  const jwt = await serverAuth.createSessionCookie(idToken, {
    // 5 days - can be up to 2 weeks
    expiresIn: authExpiry,
  });

  return redirect('/', {
    headers: {
      'Set-Cookie': await session.serialize(jwt, {
        expires: new Date(Date.now() + authExpiry),
      }),
    },
  });
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const signIn = useSignIn();

  return (
    <button type="button" onClick={() => signIn()}>
      Sign in
    </button>
  );
}
