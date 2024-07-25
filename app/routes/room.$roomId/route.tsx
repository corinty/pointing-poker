import {LinksFunction, LoaderFunctionArgs, json} from '@remix-run/node';
import {Outlet, useFetcher, useParams} from '@remix-run/react';
import Confetti from 'react-confetti';
import CopyCurrentUrlToClipboard from '~/components/CopyCurrentUrlToClipboard';
import styles from '~/styles/room.css';
import {useWindowSize} from '~/utils/useWindowSize';
import classNames from 'classnames';
import {useDisclosure} from '@mantine/hooks';
import {authenticator} from '~/services/auth.server';
import {useLiveLoader} from '~/hooks/useLiveLoaderData';
import {VoteFields, useClearVotesMutation} from '../api.story.$storyId/route';
import {StoryDetails} from '~/routes/room.$roomId/components/StoryDetails';
import {useDisplayVotesMutaiton} from '../api.room.$roomId/route';
import {useVoteStats} from './hooks/useVoteStats';
import {createRoom, getRoom} from '~/db/rooms.repository.server';
import {RefreshUsers} from './components/RefreshUsers';
import {Button} from '~/components/ui/button';

export const links: LinksFunction = () => [{rel: 'stylesheet', href: styles}];

export const pointValues = [0, 0.5, 1, 2, 3, 5, 8, 13, 20, 40, 100] as const;

export const loader = async (args: LoaderFunctionArgs) => {
  const {params} = args;
  if (!params.roomId) throw new Error('missing room ID');

  const user = await authenticator.isAuthenticated(args.request);

  let room = await getRoom(params.roomId);

  if (!room) room = await createRoom(params.roomId);

  const story = room.activeStory!;

  const votes = Object.fromEntries(
    story.votes.map((vote) => [vote.userId, vote]),
  );

  return json({room, user, story, votes});
};

export default function Room() {
  const {roomId} = useParams();
  if (!roomId) throw Error('missing param');

  const [showVotesMutation] = useDisplayVotesMutaiton(roomId);

  const fetcher = useFetcher({key: 'submitVote'});

  const {width, height} = useWindowSize();

  const {room, user: currentUser, story} = useLiveLoader<typeof loader>();

  const [shouldShowConfetti, setConfetti] = useDisclosure(false, {
    onOpen: () => {
      setTimeout(() => setConfetti.close(), 5000);
    },
  });

  const [clearVotesMutaiton] = useClearVotesMutation();

  const {
    averageVote,
    submissions,
    hasConsensus,
    users,
    suggestedVote,
    voteSpread,
  } = useVoteStats();

  if (!currentUser) return <p>oh no.....you must be logged in</p>;

  const currentUserVote = fetcher.formData
    ? Number(fetcher.formData.get(VoteFields.Points))
    : Number(users[currentUser.id]?.vote?.points);

  return (
    <div className="flex flex-col gap-2 ">
      <div className="flex items-center h-24 gap-4">
        <div>
          <h3 className="m-0">Room: {roomId}</h3>
        </div>
        <CopyCurrentUrlToClipboard />
      </div>
      <Outlet />
      <div className="flex flex-col gap-2 ">
        <StoryDetails />
        <div className="flex gap-3">
          <Button>What up my duuuude</Button>
          <button
            className="w-1/2 bg-neutral-600"
            onClick={() => {
              clearVotesMutaiton(story.id);
            }}
          >
            Clear Votes
          </button>{' '}
          <button
            className={classNames('w-1/2 ', {
              ['bg-green-500 ']: !room.displayVotes,
            })}
            onClick={() => {
              showVotesMutation(!room.displayVotes);
            }}
          >
            {room.displayVotes ? 'Hide Votes' : 'Show Votes'}
          </button>
        </div>
        <div className="flex w-full">
          <div className="w-1/2">
            <h3>Vote</h3>
            <div className="points">
              {pointValues.map((value) => (
                <fetcher.Form
                  key={value}
                  action={`/api/story/${story.id}`}
                  method="post"
                >
                  <input
                    type="hidden"
                    name={VoteFields.Action}
                    value={'submitVote'}
                    readOnly
                  />
                  <input
                    type="hidden"
                    name={VoteFields.RoomId}
                    value={room.id}
                    readOnly
                  />
                  <input
                    type="hidden"
                    name={VoteFields.Points}
                    value={value}
                    readOnly
                  />
                  <button
                    type="submit"
                    // disabled={fetcher.state !== 'idle'}
                    className={classNames('w-full border-0', {
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
          <div className="text-left ">
            <h3>Results:</h3>
            {room.displayVotes ? (
              <>
                <ul className="text-right list-none">
                  <li>
                    Suggested Vote: <mark>{suggestedVote}</mark>
                  </li>
                  <li>
                    Average: <mark>{averageVote}</mark>
                  </li>
                  <li>
                    Submitted Votes: <mark>{submissions.length}</mark>
                  </li>
                  <li>
                    Consensus:{' '}
                    <span
                      className={classNames(
                        'animate__animated p-1 radiu',
                        hasConsensus && 'bg-green-600 text-white font-bold ',
                        {animate__wobble: hasConsensus},
                      )}
                    >
                      {String(hasConsensus).toUpperCase()}
                    </span>
                  </li>
                  <li className="pt-3 font-bold text-left">
                    Vote Spread:
                    <ul className="font-normal list-inside">
                      {voteSpread.map((entry) => {
                        console.log(
                          entry.frequency,
                          [...Array(entry.frequency).keys()].map(() => '='),
                        );
                        return (
                          <li key={`vote-spread-${entry.value}`}>
                            {entry.value} * {entry.frequency}:{' '}
                            {[...Array(entry.frequency).keys()].map(() => '=')}
                          </li>
                        );
                      })}
                    </ul>
                  </li>
                </ul>
              </>
            ) : (
              <p className="text-5xl text-center">✨...🔮...🦄</p>
            )}
          </div>
        </div>
        <div className="grid grid-cols-2">
          <div className="submissions">
            <div className="flex">
              <p className="w-1/2 text-2xl font-bold">Points</p>
              <p className="w-1/2 text-2xl font-bold">Person</p>
            </div>
            <div className="flex flex-col gap-4">
              {Object.values(users).map((user) => {
                const {name, id, vote, email, profilePicture, role} = user;
                return (
                  <div className={'grid grid-cols-2 gap-2'} key={id}>
                    {room.displayVotes ? (
                      <div className="text-6xl">{vote?.points ?? '?'}</div>
                    ) : (
                      <div className="flex items-center justify-center w-2/3 text-center bg-slate-700 text-8xl">
                        {vote && <div>✅</div>}
                      </div>
                    )}
                    <div className="text-center player">
                      <div>{name || email}</div>
                      <div>
                        {/* TODO::Get user images */}
                        {role === 'anon' ? (
                          profilePicture
                        ) : (
                          <img
                            src={profilePicture || ''}
                            alt={`player: ${user.name}`}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <RefreshUsers
              userIds={Object.keys(users)}
              currentUserId={currentUser.id}
            />
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
