// app/services/auth.server.ts
import {Authenticator} from 'remix-auth';

export type User = {username: string};

// Create an instance of the authenticator, pass a generic with what
// strategies will return and will store in the session
export const authenticator = new Authenticator<User>(sessionStorage);
