// app/routes/auth/github/callback.tsx
import type {LoaderFunctionArgs} from '@remix-run/node';
import {authenticator} from '~/services/auth.server';

export async function loader({request}: LoaderFunctionArgs) {
  return authenticator.authenticate('github', request, {
    // Eventually sture reidrect in session
    successRedirect: '/dancing-bear-jump',
    failureRedirect: '/login',
  });
}
