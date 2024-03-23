import { drizzle } from './client';
import { users } from './schema';

(async () => {
  await drizzle.delete(users);

  await drizzle.insert(users).values({
    name: 'Alice Johnson',
  });
})()
  .then(() => {
    console.log('Seeded successfully.');
  })
  .catch((error) => {
    console.error('Seed error.', error);
  });
