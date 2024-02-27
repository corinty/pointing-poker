import {User} from '~/db/users';
import {createContext, useContext} from 'react';

export const UserContext = createContext<User | null>(null);

export function useCurrentUser() {
  const userContext = useContext(UserContext);

  // TODO: update this to use supabase auth
  return {...userContext, uid: '735b2ad9-97ed-4168-848e-813fc19ddcc2'};
}
