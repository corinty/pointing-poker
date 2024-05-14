import {useLoaderData, useResolvedPath, useRevalidator} from '@remix-run/react';
import {useEffect} from 'react';
import {useEventSource} from 'remix-utils/sse/react';

export function useLiveLoader<T>(streamPath?: string) {
  const path = useResolvedPath(streamPath || './stream');
  const data = useEventSource(path.pathname);

  const {revalidate} = useRevalidator();

  useEffect(() => {
    if (!data) return;
    revalidate();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- "we know better" — Moishi
  }, [data]);

  return useLoaderData<T>();
}
