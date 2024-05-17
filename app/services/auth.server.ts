// app/services/auth.server.ts
import {sessionStorage} from './session.server';
import {Authenticator} from 'remix-auth';
import {FormStrategy} from 'remix-auth-form';
import invariant from 'invariant';

import {redirect} from '@remix-run/node';
import {User, createAnonUser} from '~/db/users.repository.server';

export async function requireAuthenticatedUser(request: Request) {
  const user = await authenticator.isAuthenticated(request);

  if (!user) {
    const url = new URL(request.url);
    throw redirect(`/auth/login?redirectTo=${url.pathname}`);
  }
  return user;
}

// Create an instance of the authenticator, pass a generic with what
// strategies will return and will store in the session
export const authenticator = new Authenticator<User>(sessionStorage);

authenticator.use(
  new FormStrategy(async ({form}) => {
    // Here you can use `form` to access and input values from the form.
    // and also use `context` to access more things from the server

    invariant(
      process.env.NODE_ENV !== 'production',
      'Guest mode not allowed in production',
    );

    const guest = form.get('guest');

    if (!guest) {
      throw new Error('Guest form element missing');
    }

    return createAnonUser();
  }),
);
