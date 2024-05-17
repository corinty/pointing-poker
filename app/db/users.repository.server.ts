import {z} from 'zod';
import {db} from './drizzle.server';
import {users} from './schema/users';
import {createInsertSchema, createSelectSchema} from 'drizzle-zod';
import {generateId} from 'zoo-ids';
import {nanoid} from 'nanoid';
import randomEmoji from '~/utils/randomEmoji';

const userRoles = z.enum(['anon', 'user', 'admin']);
export type User = z.infer<typeof selectUserSchema>;

const selectUserSchema = createSelectSchema(users, {
  role: userRoles,
}).pick({
  id: true,
  email: true,
  name: true,
  role: true,
  lastSeenWhere: true,
  profilePicture: true,
});

const createUserSchema = createInsertSchema(users, {
  role: userRoles,
}).pick({
  email: true,
  name: true,
  role: true,
  profilePicture: true,
});

export const createUser = async (data: z.infer<typeof createUserSchema>) => {
  const user = await db
    .insert(users)
    .values(data)
    .returning()
    .then((a) => a[0]);

  return user.id;
};
export const createAnonUser = async () => {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('anon mode not allowed in production');
  }
  const anonNameSeed = nanoid();

  const userId = await createUser({
    name: generateId(anonNameSeed, {delimiter: ' '}),
    email: `${generateId(anonNameSeed)}+fake@example.com`,
    profilePicture: randomEmoji(),
    role: 'anon',
  });

  return getUser(userId);
};

export const getUser = async (userId: User['id']) => {
  return db.query.users.findFirst({
    where(users, {eq}) {
      return eq(users.id, userId);
    },
    columns: {
      id: true,
      email: true,
      name: true,
      profilePicture: true,
      lastSeenWhere: true,
    },
  });
};

export const getUsersAtRoute = async (route: string) => {
  return db.query.users.findMany({
    where: (users, {eq}) => eq(users.lastSeenWhere, route),
  });
};

export default {
  createUser,
  createAnonUser,
};
