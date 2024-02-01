import { cssBundleHref } from "@remix-run/css-bundle";
import type { LinksFunction } from "@remix-run/node";
import { Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration } from "@remix-run/react";
import { GithubAuthProvider, User, getAuth, signInWithPopup } from "firebase/auth";
import { useState } from "react";
import simpledotcss from "simpledotcss/simple.css";
import styles from "~/globals.css";
import { userRepository } from "./db/users";
import { UserContext } from "./hooks/useCurrentUser";

export const links: LinksFunction = () => [
  {
    rel: "stylesheet",
    href: styles,
  },
  {
    rel: "stylesheet",
    href: simpledotcss,
  },
  ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
];

const signIn = (setUser) => {
  const provider = new GithubAuthProvider();
  const auth = getAuth();

  signInWithPopup(auth, provider)
    .then((result) => {
      // This gives you a GitHub Access Token. You can use it to access the GitHub API.
      const credential = GithubAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;

      // The signed-in user info.
      const user = result.user;

      setUser(user);
      userRepository.save(user);
    })
    .catch((error) => {
      // Handle Errors here.

      const errorCode = error.code;
      const errorMessage = error.message;
      // The email of the user's account used.
      const email = error.customData.email;
      // The AuthCredential type that was used.
      const credential = GithubAuthProvider.credentialFromError(error);
      console.log("error", error, errorCode, errorMessage, email, credential);
      // ...
    });
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  getAuth().onAuthStateChanged((user) => {
    if (user) {
      setUser(user);
    }
    setLoading(false);
  });

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <nav className="pb-2 mt-6 border-0 border-b-2 border-solid border-slate-400">
          <div>
            <a href="/">Home</a>
          </div>
          <div className="sign-in">
            {!loading && user && user.displayName}
            {!loading && !user && (
              <button type="button" onClick={() => signIn(setUser)}>
                Sign in
              </button>
            )}
          </div>
        </nav>
        {!loading && user && (
          <UserContext.Provider value={user}>
            <Outlet />
          </UserContext.Provider>
        )}
        {!loading && !user && <Outlet />}
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
