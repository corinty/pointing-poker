import {createCookie} from '@remix-run/node';

export const authExpiry = 60 * 60 * 24 * 5 * 1000;

export const session = createCookie('session', {
  //TODO::Replace with env variable
  secrets: ['dancing-bear-jump'],
  path: '/',
});
