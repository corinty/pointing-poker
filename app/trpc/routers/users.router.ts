import {z} from 'zod';
import {protectedProcedure} from '../trpc.server';
import {db} from '~/db/drizzle.server';
import {users} from '~/db/schema/users';
import {eq} from 'drizzle-orm';
import {emitter} from '~/services/emitter.server';

export const usersRouter = {};
