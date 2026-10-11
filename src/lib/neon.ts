import { neon } from '@neondatabase/serverless';

/**
 * Neon Serverless Postgres Client
 * Connected to AWS US-East-2 Pooler
 */
export const NEON_CONNECTION_STRING =
  (typeof import.meta !== 'undefined' && (import.meta.env?.VITE_NEON_DATABASE_URL || import.meta.env?.DATABASE_URL)) ||
  'postgresql://neondb_owner:npg_XBb7VqeMKlF0@ep-orange-waterfall-b4d9qukd-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require';

export const sql = neon(NEON_CONNECTION_STRING);

export default sql;
