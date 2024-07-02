// app/services/auth.server.ts
import {sessionStorage} from './session.server';
import {Authenticator} from 'remix-auth';
import {FormStrategy} from 'remix-auth-form';
import {GitHubStrategy} from 'remix-auth-github';
import invariant from 'invariant';

import {redirect} from '@remix-run/node';
import {
  type User,
  createAnonUser,
  findOrCreateUserByEmail,
} from '~/db/users.repository.server';

export async function requireAuthenticatedUser(request: Request) {
  const user = await authenticator.isAuthenticated(request);

  if (!user) {
    const url = new URL(request.url);
    throw redirect(
      `/auth/login?redirectTo=${encodeURIComponent(url.pathname)}`,
    );
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

    return createAnonUser(
      form.has('name') ? String(form.get('name')) : undefined,
    );
  }),
);

// authenticator
//   // .use
//   // // new GitHubStrategy(
//   {
//     clientID: process.env.GITHUB_CLIENT_ID,
//     clientSecret: process.env.GITHUB_CLIENT_SECRET,
//     callbackURL: `http://localhost:3000/auth/github/callback`,
//   },
//   async ({profile}) => {
//     console.log(profile);
//     // Get the user data from your DB or API using the tokens and profile
//     const email = profile.emails[0].value;
//     console.log('email----', email);
//     if (!email) throw new Error('new github user email provided');

//     const user = await findOrCreateUserByEmail({
//       email,
//       name: profile.displayName,
//       profilePicture: profile.photos[0].value,
//       role: 'user',
//     });
//     console.log({freshUser: user});

//     return user;
//   },
// ),
