import {TypeOf} from 'zod';
import {zodEnv} from '~/services/env';

declare global {
  namespace NodeJS {
    interface ProcessEnv extends TypeOf<typeof zodEnv> {}
  }
}
