import { cssBundleHref } from "@remix-run/css-bundle";
import type { LinksFunction } from "@remix-run/node";
import { Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration } from "@remix-run/react";
import simpledotcss from "simpledotcss/simple.css";

const simpleCss = {
  rel: "stylesheet",
  href: simpledotcss,
};

export const links: LinksFunction = () => [...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }, simpleCss] : [simpleCss])];

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
