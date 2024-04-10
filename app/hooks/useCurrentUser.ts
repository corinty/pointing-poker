import {useRouteLoaderData} from '@remix-run/react';
import {loader} from '../root';

export function useCurrentUser() {
  const data = useRouteLoaderData<typeof loader>('root');
  if (!data?.user) return null;
  return data.user;
}
