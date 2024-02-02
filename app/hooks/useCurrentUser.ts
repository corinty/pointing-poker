import {User} from '~/db/users';
import {createContext, useContext} from 'react';

export const UserContext = createContext<User | null>(null);

export function useCurrentUser() {
  const userContext = useContext(UserContext);

  return userContext;
}
