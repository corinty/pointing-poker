import type {
  ActionFunctionArgs as ActionArgs,
  LoaderFunctionArgs as LoaderArgs,
} from '@remix-run/node';
import {fetchRequestHandler} from '@trpc/server/adapters/fetch';
import {createContext} from '~/trpc/context.server';
import {appRouter} from '~/trpc/routers/_app';

export const loader = async (args: LoaderArgs) => {
  return handleRequest(args);
};
export const action = async (args: ActionArgs) => {
  return handleRequest(args);
};
function handleRequest(args: LoaderArgs | ActionArgs) {
  return fetchRequestHandler({
    endpoint: '/trpc',
    req: args.request,
    router: appRouter,
    createContext,
  });
}
