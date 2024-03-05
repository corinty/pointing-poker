import type {ActionFunctionArgs, LinksFunction} from '@remix-run/node';
import {redirect, Link, useNavigate} from '@remix-run/react';
import {humanId} from 'human-id';
import styles from '~/styles/home.css';
import {useState} from 'react';

export const links: LinksFunction = () => [{rel: 'stylesheet', href: styles}];

export const action = async ({request}: ActionFunctionArgs) => {
  const formData = await request.formData();

  const roomCode = formData.get('join-room-code');

  return redirect(`/room/${roomCode}`);
};

export default function Index() {
  const [joinRoomValue, setJoinRoomValue] = useState('');
  const navigate = useNavigate();
  const roomCode = humanId({
    separator: '-',
    capitalize: false,
  });

  const roomUrl = `/room/${joinRoomValue}`;

  return (
    <div>
      <h1>♣️ Welcome to Pointing Poker</h1>
      <section>
        <div className="room-selection">
          <div></div>
          <Link
            to={`/room/${roomCode}`}
            className="button text-center"
            prefetch="intent"
          >
            Create Room
          </Link>
          <div className="flex col-span-2 gap-4">
            <input
              onChange={(e) => {
                setJoinRoomValue(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.code !== 'Enter') return;
                navigate(roomUrl);
              }}
              value={joinRoomValue}
              name="join-room-code"
              className="w-1/2"
              pattern="^[a-z\-]*$"
              required
            />
            <Link
              to={roomUrl}
              prefetch={joinRoomValue.length > 0 ? 'intent' : 'none'}
              className="button m-0 w-1/2 text-center"
            >
              Join Room
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
