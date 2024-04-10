// app/services/auth.server.ts
import {sessionStorage} from './session.server';
import {Authenticator} from 'remix-auth';
import {FormStrategy} from 'remix-auth-form';
import invariant from 'invariant';

import {generateId} from 'zoo-ids';

export type User = {
  id: string;
  name: string;
  email: string;
};

// Create an instance of the authenticator, pass a generic with what
// strategies will return and will store in the session
export const authenticator = new Authenticator<User>(sessionStorage);

authenticator.use(
  new FormStrategy(async ({form, context: {formData}}) => {
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

    const anonUser = {
      id: generateId(),
      name: generateId(null, {delimiter: ' '}),
      email: 'fake@example.com',
    } satisfies User;

    // You can validate the inputs however you want

    // And return the user as the Authenticator expects it
    return anonUser;
  }),
);
