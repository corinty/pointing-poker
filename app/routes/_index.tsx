import type { MetaFunction } from "@remix-run/node";
import { doc, setDoc, getDocs, collection } from "firebase/firestore";
import { db } from "~/db/firestore";
import { getAuth, signInWithPopup, GithubAuthProvider } from "firebase/auth";

export const meta: MetaFunction = () => {
  return [{ title: "New Remix App" }, { name: "description", content: "Welcome to Remix!" }];
};

const provider = new GithubAuthProvider();
const auth = getAuth();

const signIn = () => {
  signInWithPopup(auth, provider)
  .then((result) => {
    // This gives you a GitHub Access Token. You can use it to access the GitHub API.
    const credential = GithubAuthProvider.credentialFromResult(result);
    const token = credential.accessToken;

    // The signed-in user info.
    const user = result.user;
    // IdP data available using getAdditionalUserInfo(result)
    // ...
    setDoc(doc(db, "users", user.uid), {
      name: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
    });
    // look in the db for the user
    // nothing if they exist
    // add them if they don't
  }).catch((error) => {
    // Handle Errors here.

    const errorCode = error.code;
    const errorMessage = error.message;
    // The email of the user's account used.
    const email = error.customData.email;
    // The AuthCredential type that was used.
    const credential = GithubAuthProvider.credentialFromError(error);
    console.log("error", error, errorCode, errorMessage, email, credential)
    // ...
  });
}

export default function Index() {
  getDocs(collection(db, "users")).then((thing) => {
    thing.forEach((doc) => {
      console.log(`${doc.id} => ${doc.data()}`, doc.data());
    });
  });
  return (
    <div>
      <h1>Welcome to Remix</h1>
      <h2>yo my dude this is the way</h2>
      <ul>
        <li>
          <a target="_blank" href="https://remix.run/tutorials/blog" rel="noreferrer">
            15m Quickstart Blog Tutorial
          </a>
        </li>
        <li>
          <a target="_blank" href="https://remix.run/tutorials/jokes" rel="noreferrer">
            Deep Dive Jokes App Tutorial
          </a>
        </li>
        <li>
          <a target="_blank" href="https://remix.run/docs" rel="noreferrer">
            Remix Docs
          </a>
        </li>
      </ul>
      <button onClick={signIn}>GitHub Logo</button>
    </div>
  );
}
