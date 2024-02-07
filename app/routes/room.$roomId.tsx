import {LinksFunction, LoaderFunction, json} from '@remix-run/node';
import {useLoaderData, useParams} from '@remix-run/react';
import {useEffect, useState} from 'react';
import Confetti from 'react-confetti';
import CopyCurrentUrlToClipboard from '~/components/CopyCurrentUrlToClipboard';
import {useActiveStory} from '~/hooks/useActiveStory';
import {usePresentUsers} from '~/hooks/usePresentUsers';
import {useRoom} from '~/hooks/useRoom';
import styles from '~/styles/room.css';
import {useWindowSize} from '~/utils/useWindowSize';
import {storyRepository} from '~/db/stories';
import {useRequireCurrentUser} from '~/hooks/useRequireCurrentUser';
import classNames from 'classnames';
import {supabase} from '~/db/supabase';
import {Tables} from '~/db/database.types';
import type {MergeDeep} from 'type-fest';

export const links: LinksFunction = () => [{rel: 'stylesheet', href: styles}];

const pointValues = [0, 0.5, 1, 2, 3, 5, 8, 13, 20, 40, 100];

type RoomWithActiveStory = MergeDeep<
  Tables<'rooms'>,
  {
    active_story: Tables<'stories'>;
  }
>;
const getRoomWithActiveStory = (roomId: string) =>
  supabase
    .from('rooms')
    .select(`*, active_story:active_story_id(*, votes(*))`)
    .eq('id', roomId)
    .limit(1)
    .single<RoomWithActiveStory>();

export const loader: LoaderFunction = async ({params}) => {
  if (!params.roomId) throw new Error('missing room ID');
  const {data, error} = await getRoomWithActiveStory(params.roomId);
  if (error) throw new Error(error.message);
  const res = data;

  console.log(data.active_story.votes);

  if (!data) throw 'data not found';

  return json({res});
};

export default function Room() {
  const {roomId} = useParams();
  const {width, height} = useWindowSize();
  const [shouldShowConfetti, setConfetti] = useState(false);
  const currentUser = useRequireCurrentUser();
  const {data} = useLoaderData<typeof loader>();
  console.log(data);

  if (!roomId) throw Error('missing param');

  const {room, loading} = useRoom(roomId);

  const {data: presentUsers, loading: usersLoading} = usePresentUsers(roomId);
  const {
    data: activeStory,
    submitVote,
    currentUserVote,
    clearVotes,
    nextStory,
    setDisplayVotes,
    everyoneVoted,
    averageVote,
    hasConsensus,
  } = useActiveStory(roomId, room?.activeStoryId);

  useEffect(() => {
    if (!activeStory) return;

    if (hasConsensus) {
      setConfetti(true);
      setTimeout(() => setConfetti(false), 5000);
    }
  }, [activeStory, activeStory?.votes, hasConsensus, presentUsers?.length]);

  useEffect(() => {
    if (everyoneVoted) {
      setDisplayVotes(true);
    }
  }, [everyoneVoted, setDisplayVotes]);

  if (loading || !room || !activeStory || usersLoading) return;

  const {description} = activeStory;
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
            onChange={async (e) => {
              storyRepository.updateStory(roomId, room.activeStoryId, {
                description: e.target.value,
              });
            }}
          />
          <button
            style={{height: '100%', margin: '0'}}
            onClick={() => {
              nextStory();
            }}
          >
            Next Story
          </button>
        </div>
        <small className="opacity-50 mt-0">
          Story ID: {room.activeStoryId}
        </small>
      </div>
      <div className="flex gap-3">
        <button
          className="w-1/2 bg-neutral-600"
          onClick={() => {
            clearVotes();
          }}
        >
          Clear Votes
        </button>{' '}
        <button
          className={classNames('w-1/2 bg-green-500 ', {})}
          onClick={() => {
            setDisplayVotes(true);
          }}
        >
          Show Votes
        </button>
      </div>

      <div className="flex items-center gap-4">
        <h3 className="m-0 text-2xl p-0">Results:</h3>
        {activeStory.displayVotes ? (
          <>
            <p>
              Average: <mark>{averageVote ?? 0}</mark>
            </p>
            <p>
              Number of submitted Votes:{' '}
              <mark>{Object.keys(activeStory.votes).length}</mark>
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
                  'bg-green-500': value == currentUserVote?.value,
                })}
                onClick={() => submitVote(currentUser.uid, value)}
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
            {presentUsers!.map((player) => {
              const playerVoted = activeStory.votes[player.uid];
              return (
                <div className={'grid grid-cols-2 gap-2'} key={player.name}>
                  {activeStory.displayVotes ? (
                    <div className="text-9xl">
                      {activeStory?.votes[player.uid]?.value ?? '?'}
                    </div>
                  ) : (
                    <div className="bg-slate-700 w-2/3 text-8xl text-center flex justify-center items-center">
                      {playerVoted && <div>✅</div>}
                    </div>
                  )}
                  <div className="player text-center">
                    <div>{player.name || player.email}</div>
                    <div>
                      <img
                        src={player.photoURL}
                        alt={`player: ${player.name}`}
                      />
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
