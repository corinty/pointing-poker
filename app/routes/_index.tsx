import type {
  ActionFunctionArgs,
  LinksFunction,
  LoaderFunctionArgs,
} from '@remix-run/node';
import {
  redirect,
  Link,
  useNavigate,
  json,
  useLoaderData,
  Form,
  useLocation,
} from '@remix-run/react';
import styles from '~/styles/home.css';
import {useState} from 'react';
import {generateRoomCode} from '~/utils/generateRoomCode';
import {authenticator} from '~/services/auth.server';

export const links: LinksFunction = () => [{rel: 'stylesheet', href: styles}];

export async function loader({request}: LoaderFunctionArgs) {
  const user = await authenticator.isAuthenticated(request);
  return json({newRoomCode: generateRoomCode(), user});
}

export const action = async ({request}: ActionFunctionArgs) => {
  const formData = await request.formData();

  const roomCode = formData.get('join-room-code');

  return redirect(`/room/${roomCode}`);
};

export default function Index() {
  const location = useLocation();
  const [joinRoomValue, setJoinRoomValue] = useState('');
  const navigate = useNavigate();
  const {newRoomCode, user} = useLoaderData<typeof loader>();
  const roomUrl = `/room/${joinRoomValue}`;

  return (
    <>
      <h1>♣️ Welcome to Pointing Poker</h1>
      {user ? (
        <div>
          <section>
            <div className="room-selection">
              <div></div>
              <Link
                to={`/room/${newRoomCode}`}
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
      ) : (
        <div className="flex flex-col flex-wrap items-center mt-20 gap-3">
          <Form
            action="/auth/login"
            method="post"
            className="flex flex-wrap gap-3"
          >
            <input
              type="input"
              name="redirectTo"
              readOnly
              value={location.pathname}
              hidden
            />
            <div className="w-full">
              <label htmlFor="nameInput">Name:</label>
              <input
                type="input"
                id="nameInput"
                className="my-4 w-full"
                autoFocus
                autoComplete={'name'}
                name="name"
              />
            </div>
            <button type="submit" className="w-full">
              Anon Login
            </button>
          </Form>
          {/* <Form action="/auth/github" method="post">
        <button>Login with GitHub</button>
      </Form> */}
        </div>
      )}
    </>
  );
}
