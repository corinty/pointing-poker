import {LinksFunction, LoaderFunctionArgs, json} from '@remix-run/node';
import {Outlet, useFetcher, useParams} from '@remix-run/react';
import Confetti from 'react-confetti';
import CopyCurrentUrlToClipboard from '~/components/CopyCurrentUrlToClipboard';
import styles from '~/styles/room.css';
import {useWindowSize} from '~/utils/useWindowSize';
import classNames from 'classnames';
import {trpc} from '~/utils/trpc';
import {useDisclosure} from '@mantine/hooks';
import {RouterOutput, loaderTrpc} from '~/trpc/routers/_app';
import {useVotes} from '~/hooks/useVotes';
import {authenticator} from '~/services/auth.server';
import {usePresentUsers} from '~/hooks/usePresentUsers';
import {useLiveLoader} from '~/hooks/useLiveLoaderData';
import {VoteFields} from './room.$roomId.vote';

export const links: LinksFunction = () => [{rel: 'stylesheet', href: styles}];

const pointValues = [0, 0.5, 1, 2, 3, 5, 8, 13, 20, 40, 100];

export const loader = async (args: LoaderFunctionArgs) => {
  const {params} = args;
  if (!params.roomId) throw new Error('missing room ID');

  const user = await authenticator.isAuthenticated(args.request);
  const trpc = await loaderTrpc(args.request);

  const room = await trpc.rooms.get(params.roomId!);
  return json({room, user, story: room?.activeStory});
};

export default function Room() {
  const {roomId} = useParams();
  if (!roomId) throw Error('missing param');

  const users = usePresentUsers();

  const fetcher = useFetcher();

  const {width, height} = useWindowSize();

  const [shouldShowConfetti, setConfetti] = useDisclosure(false, {
    onOpen: () => {
      setTimeout(() => setConfetti.close(), 5000);
    },
  });
  const [displayVotes, displayVoteHandlers] = useDisclosure(false);

  const clearVotesMutation = trpc.story.clearAllVotes.useMutation();

  const {room, user: currentUser, story} = useLiveLoader<typeof loader>();

  const {averageVote, hasConsensus} = useVotes(roomId);

  if (!story) throw new Error('missing active story');

  if (!currentUser) return <p>oh no.....you must be logged in</p>;

  const {description, id, votes} = story;

  const currentUserVote = fetcher.formData
    ? Number(fetcher.formData.get(VoteFields.Points))
    : Number(votes.find((vote) => vote.user.id === currentUser.id)?.points);

  return (
    <div className="flex flex-col gap-2 ">
      <div className="flex items-center gap-4 h-24">
        <div>
          <h3 className="m-0">Room: {roomId}</h3>
        </div>
        <CopyCurrentUrlToClipboard />
      </div>
      <Outlet />
      <div className="flex flex-col gap-2 ">
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
                Number of submitted Votes: <mark>{votes.length}</mark>
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
                <fetcher.Form key={value} action={`./vote`} method="post">
                  <input
                    type="hidden"
                    name={VoteFields.Intent}
                    value={'submitVote'}
                    readOnly
                  />
                  <input
                    type="hidden"
                    name={VoteFields.StoryId}
                    value={room.activeStoryId!}
                    readOnly
                  />
                  <input type="hidden" name="points" value={value} readOnly />
                  <button
                    type="submit"
                    // disabled={fetcher.state !== 'idle'}
                    className={classNames({
                      // TODO:: Fix this
                      'bg-green-500': value == currentUserVote,
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
              {Object.values(users).map((user) => {
                const {name, id} =
                  user as RouterOutput['users']['usersAtRoute']['0'];
                const playerVoted = currentUserVote;
                return (
                  <div className={'grid grid-cols-2 gap-2'} key={id}>
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
    </div>
  );
}
