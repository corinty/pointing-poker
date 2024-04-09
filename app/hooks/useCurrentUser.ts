import {createContext, useContext} from 'react';
import {SelectUser} from '~/db/schema/users';
import {getBrowserEnv, isBrowser} from '~/utils/getBrowserEnv';
import {generateId} from 'zoo-ids';

export const UserContext = createContext<SelectUser | null>(null);

export function useCurrentUser() {
  const userContext = useContext(UserContext);

  // TODO: update this to use supabase auth
  return getBrowserEnv().ANON_MODE
    ? sessionAnonUser()
    : {...userContext, uid: '735b2ad9-97ed-4168-848e-813fc19ddcc2'};
}

const storageKey = 'anonUser';

function sessionAnonUser(): SelectUser {
  const anonUser = {
    createdAt: new Date(),
    id: generateId(),
    name: generateId(null, {delimiter: ' '}),
    email: 'fake@example.com',
  } satisfies SelectUser;

  if (!isBrowser()) return anonUser;

  if (sessionStorage.getItem(storageKey)) {
    return JSON.parse(sessionStorage.getItem(storageKey)!) satisfies SelectUser;
  }

  sessionStorage.setItem(storageKey, JSON.stringify(anonUser));

  return anonUser;
}
