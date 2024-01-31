import { getAuth, signInWithPopup, GithubAuthProvider } from "firebase/auth";

import type { ActionFunctionArgs, LinksFunction, MetaFunction } from "@remix-run/node";
import { Form, json, redirect, useNavigate, useNavigation } from "@remix-run/react";
import { getDocs, collection, setDoc, doc } from "firebase/firestore";
import { humanId } from "human-id";
import { db } from "~/db/firestore";
import styles from "~/styles/home.css";

const provider = new GithubAuthProvider();
const auth = getAuth();

const signIn = () => {
  signInWithPopup(auth, provider)
    .then((result) => {
      // This gives you a GitHub Access Token. You can use it to access the GitHub API.
      const credential = GithubAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;

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

export const links: LinksFunction = () => [{ rel: "stylesheet", href: styles }];

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();

  const roomCode = formData.get("join-room-code");

  return redirect(`/room/${roomCode}`);
};

export default function Index() {
  const navigate = useNavigate();
  return (
    <div>
      <h1>♣️ Welcome to Pointing Poker</h1>
      <section>
        <Form className="room-selection" action="POST">
          <div></div>
          <button
            onClick={() => {
              // generate room code
              const roomCode = humanId({
                separator: "-",
                capitalize: false,
              });
              // navigate to the room
              navigate(`/room/${roomCode}`);
            }}
          >
            Create Room
          </button>
          <input name="join-room-code" pattern="^[a-z\-]*$" required />
          <button type="submit">Join Room</button>
        </Form>
      </section>
    </div>
  );
}
