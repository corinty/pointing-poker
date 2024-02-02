import {cssBundleHref} from '@remix-run/css-bundle';
import type {ActionFunction, LinksFunction} from '@remix-run/node';
import {json, redirect} from '@remix-run/node';
import {useFetcher} from '@remix-run/react';
import {GithubAuthProvider, getAuth, signInWithPopup} from 'firebase/auth';
import {useEffect, useState} from 'react';
import {type User, userRepository} from '~/db/users';
import {authExpiry, session} from '~/cookies';
import {auth as serverAuth} from '~/db/firebase.server';

export function useSignIn() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User>();
  const fetcher = useFetcher();

  useEffect(() => {
    getAuth().onAuthStateChanged((firebaseUser) => {
      console.log('auth state changed', firebaseUser);
      if (firebaseUser) {
        // const user = userRepository.fromFirebaseToUser(firebaseUser);
        // setUser(user);
      }
      setLoading(false);
    });
  }, []);

  const signIn = () => {
    console.log("let's go");
    const provider = new GithubAuthProvider();
    const auth = getAuth();

    signInWithPopup(auth, provider)
      .then(async (result) => {
        console.log('result going');
        // This gives you a GitHub Access Token. You can use it to access the GitHub API.
        // const credential = GithubAuthProvider.credentialFromResult(result);
        const credential = GithubAuthProvider.credentialFromResult(result);
        const token = credential?.idToken;

        if (token === undefined) throw new Error('Token not found');
        // Trigger a POST request which the action will handle

        // The signed-in user info.
        const firebaseUser = result.user;

        console.log('Setting user to ', firebaseUser);
        await userRepository.save(firebaseUser);
        fetcher.submit({idToken: token}, {method: 'post', action: '/login'});
      })
      .catch((error) => {
        // Handle Errors here.

        console.log('error', error);
        // ...
      });
  };

  return signIn;
}
