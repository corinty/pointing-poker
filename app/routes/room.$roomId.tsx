import {LinksFunction} from '@remix-run/node';
import {useParams} from '@remix-run/react';
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
import toast from 'react-hot-toast';

export const links: LinksFunction = () => [{rel: 'stylesheet', href: styles}];

const pointValues = [0, 0.5, 1, 2, 3, 5, 8, 13, 20, 40, 100];

export default function Room() {
  const {roomId} = useParams();
  const {width, height} = useWindowSize();
  const [shouldShowConfetti, setConfetti] = useState(false);
  const [shakeShowVotes, setShakeShowVotes] = useState(false);
  const currentUser = useRequireCurrentUser();

  if (!roomId) throw Error('missing param');

  const {room, loading} = useRoom(roomId);

  const {data: presentUsers, loading: usersLoading} = usePresentUsers(roomId);
  const {
    data: activeStory,
    submitVote,
    currentUserVote,
    clearVotes,
    nextStory,
    toggleDisplayVotes,
    setDisplayVotes,
    everyoneVoted,
  } = useActiveStory(roomId, room?.activeStoryId);

  useEffect(() => {
    if (!activeStory) return;
    const votes = Object.values(activeStory.votes);

    if (everyoneVoted || shakeShowVotes) {
      setDisplayVotes(true);
    } else {
      setDisplayVotes(false);
    }
    const hasConsensus =
      presentUsers?.length == votes.length &&
      votes.every((vote) => vote == votes[0]);
  }, [
    activeStory,
    everyoneVoted,
    presentUsers?.length,
    setDisplayVotes,
    shakeShowVotes,
  ]);

  if (loading || !room || !activeStory || usersLoading) return;

  const {displayVotes, description, votes} = activeStory;

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
          className={classNames('w-1/2 bg-green-500 ', {
            animate__shakeX: shakeShowVotes,
            animate__animated: shakeShowVotes,
          })}
          onClick={() => {
            console.log({everyoneVoted, shakeShowVotes});
            if (!everyoneVoted && !shakeShowVotes) {
              setShakeShowVotes(true);
              toast('Missing votes...');
            }
            setDisplayVotes(true);
          }}
        >
          Show Votes
        </button>
      </div>

      <div className="grid grid-cols-2">
        <div>
          <h3>Vote</h3>
          <div className="points">
            {pointValues.map((value) => (
              <button
                key={value}
                className={classNames({
                  'bg-green-500': value == currentUserVote,
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
              return (
                <div className={'grid grid-cols-2 gap-2'} key={player.name}>
                  {activeStory.displayVotes ? (
                    <div className="text-9xl">
                      {activeStory?.votes[player.uid]}
                    </div>
                  ) : (
                    <div className="bg-slate-700 w-2/3"></div>
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
