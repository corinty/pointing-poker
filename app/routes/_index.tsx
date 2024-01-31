import type { MetaFunction } from "@remix-run/node";
import { getDocs, collection } from "firebase/firestore";
import { db } from "~/db/firestore";

export const meta: MetaFunction = () => {
  return [{ title: "New Remix App" }, { name: "description", content: "Welcome to Remix!" }];
};

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
    </div>
  );
}
