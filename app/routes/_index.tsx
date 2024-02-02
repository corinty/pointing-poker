import type {ActionFunctionArgs, LinksFunction} from '@remix-run/node';
import {Form, redirect, useNavigate} from '@remix-run/react';
import {humanId} from 'human-id';
import styles from '~/styles/home.css';
import {initializeFirestore} from '~/db/firestore';

export const links: LinksFunction = () => [{rel: 'stylesheet', href: styles}];

export const action = async ({request}: ActionFunctionArgs) => {
  const formData = await request.formData();

  const roomCode = formData.get('join-room-code');

  return redirect(`/room/${roomCode}`);
};

export default function Index() {
  initializeFirestore();
  const navigate = useNavigate();

  return (
    <div>
      <h1>♣️ Welcome to Pointing Poker</h1>
      <section>
        <div className="room-selection">
          <div></div>
          <button
            onClick={() => {
              // generate room code
              const roomCode = humanId({
                separator: '-',
                capitalize: false,
              });
              // navigate to the room
              navigate(`/room/${roomCode}`);
            }}
          >
            Create Room
          </button>
          <Form className="flex col-span-2 gap-4" method="post">
            <input
              name="join-room-code"
              className="w-1/2"
              pattern="^[a-z\-]*$"
              required
            />
            <button type="submit" className="w-1/2">
              Join Room
            </button>
          </Form>
        </div>
      </section>
    </div>
  );
}
