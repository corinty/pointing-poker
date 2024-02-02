import {LinksFunction} from '@remix-run/node';
import {useParams} from '@remix-run/react';
import {Fragment, useEffect, useState} from 'react';
import Confetti from 'react-confetti';
import CopyCurrentUrlToClipboard from '~/components/CopyCurrentUrlToClipboard';
import {useActiveStory} from '~/hooks/useActiveStory';
import {usePresentUsers} from '~/hooks/usePresentUsers';
import {useRoom} from '~/hooks/useRoom';
import styles from '~/styles/room.css';
import {useWindowSize} from '~/utils/useWindowSize';
import {storyRepository} from '~/db/stories';
import {useRequireCurrentUser} from '~/hooks/useRequireCurrentUser';

export const links: LinksFunction = () => [{rel: 'stylesheet', href: styles}];

const pointValues = [0, 0.5, 1, 2, 3, 5, 8, 13, 20, 40, 100];

export default function Room() {
  const {roomId} = useParams();
  const {width, height} = useWindowSize();
  const [shouldShowConfetti, setConfetti] = useState(false);
  const currentUser = useRequireCurrentUser();

  if (!roomId) throw Error('missing param');

  const {room, loading} = useRoom(roomId);

  const {data: usersData, loading: usersLoading} = usePresentUsers(roomId);
  const {
    data: activeStory,
    submitVote,
    currentUserVote,
    clearVotes,
    nextStory,
    toggleDisplayVotes,
  } = useActiveStory(roomId, room?.activeStoryId);

  useEffect(() => {
    if (!activeStory) return;
    const votes = Object.values(activeStory.votes);
    const hasConsensus =
      usersData?.length == votes.length &&
      votes.every((vote) => vote == votes[0]);

    setConfetti(hasConsensus);
  }, [activeStory]);
  console.log({room, activeStory, usersLoading});
  if (loading || !room || !activeStory || usersLoading) return;

  const {displayVotes, description} = activeStory;

  return (
    <div className="flex flex-col gap-2">
      <div className="">
        <h1>Room: {roomId}</h1> <CopyCurrentUrlToClipboard />
      </div>
      <p className="text-2xl">Issue Description:</p>
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
          className={classNames('w-1/2', {
            'bg-green-500': !displayVotes,
          })}
          onClick={toggleDisplayVotes}
        >
          {activeStory.displayVotes ? 'Hide' : 'Show'} Votes
        </button>
      </div>
      <div className="points">
        {pointValues.map((value) => (
          <button
            key={value}
            className={classNames({'bg-green-500': value == currentUserVote})}
            onClick={() => submitVote(currentUser.uid, value)}
          >
            {value}
          </button>
        ))}
      </div>

      <div className="submissions">
        <p className="text-2xl font-bold">Person</p>
        <p className="text-2xl font-bold">Points</p>
        {usersData!.map((player) => {
          return (
            <Fragment key={player.name}>
              <div className="player text-center">
                <div>{player.name || player.email}</div>
                <div>
                  <img src={player.photoURL} />
                </div>
              </div>
              {activeStory.displayVotes ? (
                <div className="text-9xl">{activeStory?.votes[player.uid]}</div>
              ) : (
                <div className="text-9xl bg-slate-900 h-2/3 w-2/3"></div>
              )}
            </Fragment>
          );
        })}
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
