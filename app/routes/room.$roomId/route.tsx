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
import {motion, AnimatePresence} from 'framer-motion';

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

  const {
    room,
    user: currentUser,
    story,
    votes,
  } = useLiveLoader<typeof loader>();

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
      <div className="flex items-center gap-4 h-24">
        <div>
          <h3 className="m-0">Room: {roomId}</h3>
        </div>
        <CopyCurrentUrlToClipboard />
      </div>
      <Outlet />
      <div className="flex flex-col gap-2 ">
        <StoryDetails />
        <div className="flex gap-3">
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
            <h3>
              Vote:{' '}
              <small className="font-normal">
                {
                  Object.keys(votes).filter((userId) => {
                    return userId in users;
                  }).length
                }
                /{Object.keys(users).length} submitted
              </small>
            </h3>
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
          <div className="text-left">
            <h3 className="mb-1">Results: </h3>
            {room.displayVotes ? (
              <>
                <ul
                  className="text-right list-none p-0 "
                  style={{width: 'fit-content'}}
                >
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
                </ul>
                <div className="text-left pt-3 font-bold">
                  Vote Spread:
                  <ul className="list-inside font-normal flex flex-col gap-3">
                    {voteSpread.map((entry) => {
                      console.log(entry);
                      return (
                        <li key={`vote-spread-${entry.value}`} className="flex">
                          Points: {entry.value} * {entry.frequency}:
                          <span
                            className="font-bold text-black ml-3 px-2 rounded"
                            style={{
                              backgroundColor: 'var(--accent)',
                            }}
                          >
                            {Array.from(Array(entry.frequency)).map(() => '=')}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </>
            ) : (
              <p className="text-center text-5xl">✨...🔮...🦄</p>
            )}
          </div>
        </div>
        <div>
          <div className="submissions">
            <div className="submission submission__header">
              <p className="text-2xl font-bold text-right m-0">Points</p>
              <p className="text-2xl font-bold m-0">Person</p>
            </div>
            {Object.keys(users).length > 0 && (
              <AnimatePresence initial={false} mode="popLayout">
                {Object.values(users).map((user) => {
                  const {name, id, vote, email, profilePicture, role} = user;
                  return (
                    <motion.div
                      className="submission"
                      key={`user-vote-status-${id}`}
                      initial={{scale: 0.8, opacity: 0, x: -100}}
                      animate={{scale: 1, opacity: 1, x: 0}}
                      exit={{scale: 0.8, opacity: 0, x: 100}}
                    >
                      {room.displayVotes ? (
                        <div className="text-2x submission__points">
                          {vote?.points ?? '?'}
                        </div>
                      ) : (
                        <div className="text-43xl flex justify-end submission__points">
                          {vote ? <div>✅</div> : <div>❔</div>}
                        </div>
                      )}
                      <div className="player flex gap-3">
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
                        <div className="player__name">{name || email}</div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
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
  );
}
