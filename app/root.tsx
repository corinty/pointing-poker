/* eslint-disable jsx-a11y/click-events-have-key-events */

import {cssBundleHref} from '@remix-run/css-bundle';
import '@mantine/core/styles.css';
import '@mantine/nprogress/styles.css';
import type {
  LinksFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from '@remix-run/node';
import {
  Form,
  Link,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  json,
  useLoaderData,
  useLocation,
} from '@remix-run/react';
import simpledotcss from 'simpledotcss/simple.css';
import styles from '~/globals.css';
import animateCss from 'animate.css/animate.css';
import {Toaster} from 'react-hot-toast';
import {ColorSchemeScript, MantineProvider} from '@mantine/core';
import {GlobalLoadingIndicator} from './components/GlobalLoadingIndicator';
import {getBrowserEnv} from './utils/getBrowserEnv';
import {authenticator} from './services/auth.server';
import favicon from './img/favicon.svg';

export async function loader({request}: LoaderFunctionArgs) {
  const user = await authenticator.isAuthenticated(request);

  return json({
    ENV: getBrowserEnv(),
    user,
  });
}

export const meta: MetaFunction = () => {
  return [
    {title: 'Issue Pointing'},
    {
      name: 'description',
      content:
        'Use issue pointing to better size and estimate your iterations.',
    },
  ];
};

export const links: LinksFunction = () => [
  {
    rel: 'icon',
    href: favicon,
  },
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
  const data = useLoaderData<typeof loader>();
  const location = useLocation();
  const {ENV, user} = data;

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
        <MantineProvider defaultColorScheme="dark">
          <GlobalLoadingIndicator />
          <nav className="pb-2 mt-6 border-0 border-b-2 border-solid border-slate-400">
            <div>
              <Link to="/">Home</Link>
            </div>
            {!location.pathname.includes('login') && (
              <div className="sign-in">
                {user ? (
                  <Form method="post" action="/auth/logout">
                    <button type="submit">
                      Logout: {user.name}{' '}
                      {user.role == 'anon' && user.profilePicture}
                    </button>
                  </Form>
                ) : (
                  <Link
                    to={`/auth/login?redirectTo=${encodeURIComponent(
                      location.pathname,
                    )}`}
                  >
                    <button>Log In</button>
                  </Link>
                )}
              </div>
            )}
          </nav>
          <Outlet />
          <script
            dangerouslySetInnerHTML={{
              __html: `window.ENV = ${JSON.stringify(ENV)}`,
            }}
          />
          <Toaster />
          <ScrollRestoration />
          <Scripts />
          <LiveReload />
        </MantineProvider>
      </body>
    </html>
  );
}
