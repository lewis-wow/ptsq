import { join } from 'path';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

const migrationClient = postgres(process.env.DATABASE_URL, { max: 1 });

migrate(drizzle(migrationClient), {
  migrationsFolder: join(__dirname, 'migrations'),
})
  .then(() => {
    console.log('Migration successful.');
  })
  .catch((error) => {
    console.error('Migration error.', error);
  });
