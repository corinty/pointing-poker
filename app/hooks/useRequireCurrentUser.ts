import {useNavigate} from '@remix-run/react';
import {useCurrentUser} from './useCurrentUser';

export function useRequireCurrentUser() {
  const user = useCurrentUser();
  const navigate = useNavigate();

  if (!user) {
    return navigate('/', {state: {loginRequired: true}});
  }

  return user;
}
