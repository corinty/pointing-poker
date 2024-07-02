import {z} from 'zod';
import {db} from './drizzle.server';
import {users} from './schema/users';
import {createInsertSchema, createSelectSchema} from 'drizzle-zod';
import {generateId} from 'zoo-ids';
import {nanoid} from 'nanoid';
import randomEmoji from '~/utils/randomEmoji';
import {eq} from 'drizzle-orm';
import {emitter} from '~/services/emitter.server';

const userRoles = z.enum(['anon', 'user', 'admin']);
export type User = z.infer<typeof selectUserSchema>;

export const selectUserSchema = createSelectSchema(users, {
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
    .values({id: nanoid(), ...data})
    .returning()
    .then((a) => a[0]);

  return user.id;
};
export const createAnonUser = async (name?: string): Promise<User> => {
  const anonNameSeed = nanoid();

  try {
    const userId = await createUser({
      name:
        name && name?.length > 0
          ? name
          : generateId(anonNameSeed, {delimiter: ' '}),
      email: `${name}+${generateId(anonNameSeed)}+fake@example.com`,
      profilePicture: randomEmoji(),
      role: 'anon',
    });

    return getUser(userId);
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getUser = async (userId: User['id']) => {
  const user = await db.query.users.findFirst({
    where(users, {eq}) {
      return eq(users.id, userId);
    },
    columns: {
      id: true,
      email: true,
      name: true,
      profilePicture: true,
      lastSeenWhere: true,
      role: true,
    },
  });
  if (!user) throw new Error('no user found');

  return selectUserSchema.parse(user);
};

export const updateUserPresence = async ({
  route,
  userId,
}: {
  route: string | null;
  userId: User['id'];
}) => {
  const updatedUser = await db
    .update(users)
    .set({
      lastSeenWhere: route,
      lastSeenAt: new Date(),
    })
    .where(eq(users.id, userId))
    .returning();

  emitter.emit('userJoin', route);

  if (!route) return updatedUser;

  return db.query.users.findMany({
    where: (users, {eq}) => eq(users.lastSeenWhere, route),
  });
};

export const findOrCreateUserByEmail = async (
  args: z.infer<typeof createUserSchema>,
) => {
  const user = await db
    .insert(users)
    .values(args)
    .onConflictDoUpdate({target: users.email, set: args})
    .returning();

  return selectUserSchema.parse(user);
};

export const presentUserSchema = selectUserSchema.omit({lastSeenWhere: true});

export type PresentUser = z.infer<typeof presentUserSchema>;

export const getUsersAtRoute = async (route: string) => {
  const users = await db.query.users.findMany({
    columns: {
      id: true,
      email: true,
      name: true,
      role: true,
      profilePicture: true,
    },
    where: (users, {eq}) => eq(users.lastSeenWhere, route),
  });

  return Promise.all(users.map((user) => presentUserSchema.parseAsync(user)));
};

export default {
  createUser,
  createAnonUser,
};
