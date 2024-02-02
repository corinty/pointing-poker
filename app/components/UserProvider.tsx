import {User} from 'firebase/auth';
import {UserContext} from '../hooks/useCurrentUser';

interface Props {
  user: User;
  children: any;
}

export function UserProvider({user, children}: Props) {
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}
