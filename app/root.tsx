/* eslint-disable jsx-a11y/click-events-have-key-events */

import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {httpBatchLink} from '@trpc/client';
import {trpc} from '~/utils/trpc';

import {cssBundleHref} from '@remix-run/css-bundle';
import '@mantine/core/styles.css';
import '@mantine/nprogress/styles.css';
import type {LinksFunction} from '@remix-run/node';
import {
  Link,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  json,
  useLoaderData,
} from '@remix-run/react';
import {useState} from 'react';
import simpledotcss from 'simpledotcss/simple.css';
import styles from '~/globals.css';
import animateCss from 'animate.css/animate.css';
import {Toaster} from 'react-hot-toast';
import classNames from 'classnames';
import {ColorSchemeScript, MantineProvider} from '@mantine/core';
import {GlobalLoadingIndicator} from './components/GlobalLoadingIndicator';
import {getBrowserEnv} from './utils/getBrowserEnv';

export async function loader() {
  return json({
    ENV: getBrowserEnv(),
  });
}

export const links: LinksFunction = () => [
  {
    rel: 'stylesheet',
    href: simpledotcss,
  },
  {
    rel: 'stylesheet',
    href: styles,
  },
  {
    rel: 'stylesheet',
    href: animateCss,
  },
  ...(cssBundleHref ? [{rel: 'stylesheet', href: cssBundleHref}] : []),
];

export default function App() {
  const [queryClient] = useState(() => new QueryClient());
  const data = useLoaderData<typeof loader>();
  const {ENV} = data;
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: `${ENV.SITE_URL ? ENV.SITE_URL : 'http://localhost:3000'}/trpc`,
          // You can pass any HTTP headers you wish here
          async headers() {
            return {};
          },
        }),
      ],
    }),
  );

  const loginRequired = false;

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <ColorSchemeScript />
      </head>
      <body>
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
          <QueryClientProvider client={queryClient}>
            <MantineProvider defaultColorScheme="dark">
              <GlobalLoadingIndicator />
              <nav className="pb-2 mt-6 border-0 border-b-2 border-solid border-slate-400">
                <div>
                  <Link to="/">Home</Link>
                </div>
                <div className="sign-in">
                  {true && (
                    <button
                      type="button"
                      className={classNames('animate__animated', {
                        animate__wobble: loginRequired,
                        'bg-purple-700': loginRequired,
                        'text-white': loginRequired,
                      })}
                      onClick={() => {
                        // TODO:: Signin
                      }}
                    >
                      Sign in
                    </button>
                  )}
                </div>
              </nav>
              <Outlet />
              <script
                dangerouslySetInnerHTML={{
                  __html: `window.ENV = ${JSON.stringify(ENV)}`,
                }}
              />
              {loginRequired && (
                <div className="flex justify-center">
                  <button
                    className="notice w-1/2 text-center text-white"
                    onClick={() => {
                      // TODO:: Sign
                    }}
                  >
                    ⬆️ Please sign in ⬆️
                  </button>
                </div>
              )}
              <Toaster />
              <ScrollRestoration />
              <Scripts />
              <LiveReload />
            </MantineProvider>
          </QueryClientProvider>
        </trpc.Provider>
      </body>
    </html>
  );
}
