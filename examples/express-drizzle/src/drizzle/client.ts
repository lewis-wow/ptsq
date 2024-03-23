import { drizzle as drizzlePostgresJs } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const queryClient = postgres(process.env.DATABASE_URL);

export const drizzle = drizzlePostgresJs(queryClient);
