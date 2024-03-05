import {LinksFunction, LoaderFunctionArgs, json} from '@remix-run/node';
import {useLoaderData, useParams} from '@remix-run/react';
import Confetti from 'react-confetti';
import CopyCurrentUrlToClipboard from '~/components/CopyCurrentUrlToClipboard';
import styles from '~/styles/room.css';
import {useWindowSize} from '~/utils/useWindowSize';
import {useRequireCurrentUser} from '~/hooks/useRequireCurrentUser';
import classNames from 'classnames';
import {trpc} from '~/utils/trpc';
import {useDisclosure} from '@mantine/hooks';
import {usePresenceNext} from '~/hooks/usePresenceNext';
import {loaderTrpc} from '~/trpc/routers/_app';
import {useVotes} from '~/hooks/useVotes';

export const links: LinksFunction = () => [{rel: 'stylesheet', href: styles}];

const pointValues = [0, 0.5, 1, 2, 3, 5, 8, 13, 20, 40, 100];

export const loader = async (args: LoaderFunctionArgs) => {
  const {params} = args;
  if (!params.roomId) throw new Error('missing room ID');

  const trpc = loaderTrpc(args);

  return json(await trpc.rooms.get(params.roomId!));
};

export default function Room() {
  const {roomId} = useParams();
  if (!roomId) throw Error('missing param');

  const {width, height} = useWindowSize();

  const [shouldShowConfetti, setConfetti] = useDisclosure(false, {
    onOpen: () => {
      setTimeout(() => setConfetti.close(), 5000);
    },
  });
  const [displayVotes, displayVoteHandlers] = useDisclosure(false);

  const {broadcastVote, presentUsers} = usePresenceNext(roomId);

  const clearVotesMutation = trpc.story.clearAllVotes.useMutation();
  const submitVoteMutation = trpc.story.submitVote.useMutation();

  const currentUser = useRequireCurrentUser();

  const initialData = useLoaderData<typeof loader>();

  const {data} = trpc.rooms.get.useQuery(roomId, {initialData});

  const {averageVote, everyoneVoted, hasConsensus, votes, submittedVotes} =
    useVotes(roomId);

  if (!data.activeStory) throw new Error('missing active story');
  const {description, id} = data.activeStory;

  const submitVote = (voteValue: number) => {
    submitVoteMutation.mutate({
      storyId: id,
      userId: currentUser.uid,
      points: voteValue.toString(),
    });

    broadcastVote(voteValue);
  };

  return (
    <div className="flex flex-col gap-2 ">
      <div className="flex items-center gap-4 h-24">
        <div>
          <h3 className="m-0">Room: {roomId}</h3>
        </div>
        <CopyCurrentUrlToClipboard />
      </div>
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
        {/* TODO fix this */}
        {false ? (
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
              <button
                key={value}
                className={classNames({
                  // TODO:: Fix this
                  // 'bg-green-500': value == currentUserVote?.value,
                })}
                onClick={() => submitVote(value)}
              >
                {value}
              </button>
            ))}
          </div>
        </div>

        <div className="submissions">
          <div className="flex">
            <p className="text-2xl font-bold w-1/2">Points</p>
            <p className="text-2xl font-bold w-1/2">Person</p>
          </div>
          <div className="flex flex-col gap-4">
            {Object.values(presentUsers)?.map((user) => {
              const playerVoted = user.vote;
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
