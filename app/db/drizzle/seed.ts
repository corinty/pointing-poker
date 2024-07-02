import {createRoom} from '~/db/rooms.repository.server';

const main = async () => {
  const roomIds = [
    'dancing-bear-jump',
    'big-camel-smile',
    'small-chickens-fly',
  ];

  console.log('Seed start');
  Promise.all(roomIds.map((id) => createRoom(id)));
  console.log('Seed done');
};

main();
