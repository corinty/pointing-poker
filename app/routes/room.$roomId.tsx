import {
  ActionFunctionArgs,
  LinksFunction,
  LoaderFunctionArgs,
  json,
} from '@remix-run/node';
import {namedAction} from 'remix-utils/named-action';
import {Outlet, useFetcher, useLocation, useParams} from '@remix-run/react';
import Confetti from 'react-confetti';
import CopyCurrentUrlToClipboard from '~/components/CopyCurrentUrlToClipboard';
import styles from '~/styles/room.css';
import {useWindowSize} from '~/utils/useWindowSize';
import classNames from 'classnames';
import {trpc} from '~/utils/trpc';
import {useDisclosure} from '@mantine/hooks';
import {loaderTrpc} from '~/trpc/routers/_app';
import {useVotes} from '~/hooks/useVotes';
import {authenticator, requireAuthenticatedUser} from '~/services/auth.server';
import {usePresenceUsers} from '~/hooks/usePresenceUsers';
import {useLiveLoader} from '~/hooks/useLiveLoaderData';
import {insertVoteSchema} from '~/db/schema/votes';
import {withZod} from '@remix-validated-form/with-zod';

export const links: LinksFunction = () => [{rel: 'stylesheet', href: styles}];

const pointValues = [0, 0.5, 1, 2, 3, 5, 8, 13, 20, 40, 100];

export const loader = async (args: LoaderFunctionArgs) => {
  const {params} = args;
  if (!params.roomId) throw new Error('missing room ID');

  const user = await authenticator.isAuthenticated(args.request);
  const trpc = loaderTrpc(args);

  const room = await trpc.rooms.get(params.roomId!);

  return json({room, user});
};

const voteValidator = withZod(insertVoteSchema);

export default function Room() {
  const {roomId} = useParams();
  if (!roomId) throw Error('missing param');
  const location = useLocation();

  const users = usePresenceUsers(location.pathname);

  const fetcher = useFetcher();

  const {width, height} = useWindowSize();

  const [shouldShowConfetti, setConfetti] = useDisclosure(false, {
    onOpen: () => {
      setTimeout(() => setConfetti.close(), 5000);
    },
  });
  const [displayVotes, displayVoteHandlers] = useDisclosure(false);

  const clearVotesMutation = trpc.story.clearAllVotes.useMutation();
  const pingRoom = trpc.story.pingRoom.useMutation();

  const {room, user: currentUser} = useLiveLoader<typeof loader>();

  const {averageVote, hasConsensus, submittedVotes} = useVotes(roomId);

  if (!room.activeStory) throw new Error('missing active story');

  const {description, id, votes} = room.activeStory;

  const currentUserVote = (() => {
    const userEntry = votes.find((vote) => vote.userId === currentUser.id);

    if (userEntry?.points) return parseInt(userEntry.points);

    return null;
  })();

  const submitVote = (voteValue: number) => {
    submitVoteMutation.mutate({
      storyId: id,
      userId: currentUser.id,
      points: voteValue.toString(),
    });
  };

  return (
    <div className="flex flex-col gap-2 ">
      <div className="flex items-center gap-4 h-24">
        <div>
          <h3 className="m-0">Room: {roomId}</h3>
        </div>
        <CopyCurrentUrlToClipboard />
      </div>
      <Outlet />
      <div>
        <div className="flex gap-2">
          <textarea
            className="m-0 min-h-32 w-1/2"
            value={description || ''}
            onChange={async () => {
              // TODO way to update and sync story description
            }}
          />
          <button
            style={{height: '100%', margin: '0'}}
            onClick={() => {
              // TODO Next Story fn
              pingRoom.mutate();
            }}
          >
            Next Story
          </button>
        </div>
        <small className="opacity-50 mt-0">Story ID: {id}</small>
      </div>
      <div className="flex gap-3">
        <button
          className="w-1/2 bg-neutral-600"
          onClick={() => {
            // TODO:: Need to clear local presence votes
            // Clear Votes
            clearVotesMutation.mutate(id);
          }}
        >
          Clear Votes
        </button>{' '}
        <button
          className={classNames('w-1/2 bg-green-500 ', {})}
          onClick={() => {
            displayVoteHandlers.open();
          }}
        >
          Show Votes
        </button>
      </div>

      <div className="flex items-center gap-4">
        <h3 className="m-0 text-2xl p-0">Results:</h3>
        {displayVotes ? (
          <>
            <p>
              Average: <mark>{averageVote}</mark>
            </p>
            <p>
              Number of submitted Votes: <mark>{submittedVotes.length}</mark>
            </p>
            <p className="flex gap-2">
              {' '}
              Consensus:{' '}
              <div
                className={classNames(
                  'animate__animated p-1 radiu',
                  hasConsensus && 'bg-green-600 text-white font-bold ',
                  {animate__wobble: hasConsensus},
                )}
              >
                {hasConsensus.toString().toUpperCase()}
              </div>
            </p>
          </>
        ) : (
          <p>✨...🔮...🦄</p>
        )}
      </div>

      <div className="grid grid-cols-2">
        <div>
          <h3>Vote</h3>
          <div className="points">
            {pointValues.map((value) => (
              <fetcher.Form key={value} method="post">
                <input
                  type="hidden"
                  name="intent"
                  value={'submitVote'}
                  readOnly
                />
                <input type="hidden" name="points" value={value} readOnly />
                <input
                  type="hidden"
                  name="userId"
                  value={currentUser.id}
                  readOnly
                />
                <input type="hidden" name="storyId" value={id} readOnly />
                <button
                  type="submit"
                  disabled={fetcher.state !== 'idle'}
                  className={classNames({
                    // TODO:: Fix this
                    'bg-green-500':
                      value == Number(fetcher?.formData?.get('vote')),
                  })}
                >
                  {value}
                </button>
              </fetcher.Form>
            ))}
          </div>
        </div>

        <div className="submissions">
          <div className="flex">
            <p className="text-2xl font-bold w-1/2">Points</p>
            <p className="text-2xl font-bold w-1/2">Person</p>
          </div>
          <div className="flex flex-col gap-4">
            {Object.values(users)?.map((user) => {
              const playerVoted = currentUserVote;
              return (
                <div className={'grid grid-cols-2 gap-2'} key={user.name}>
                  {displayVotes ? (
                    <div className="text-9xl">{user.vote ?? '?'}</div>
                  ) : (
                    <div className="bg-slate-700 w-2/3 text-8xl text-center flex justify-center items-center">
                      {playerVoted && <div>✅</div>}
                    </div>
                  )}
                  <div className="player text-center">
                    <div>{user.name || user.email}</div>
                    <div>
                      {/* TODO::Get user images */}
                      {/* <img src={user.photoURL} alt={`player: ${user.name}`} /> */}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {shouldShowConfetti && (
        <div style={{display: 'fixed', top: 0, left: 0}}>
          {' '}
          <Confetti width={width} height={height} />
        </div>
      )}
    </div>
  );
}
