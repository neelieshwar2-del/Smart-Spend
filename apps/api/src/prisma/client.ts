import { PrismaClient } from '@prisma/client';
import { config } from '../config/index.js';

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

/**
 * Safely encodes raw '@' characters inside the password segment of a PostgreSQL connection URL
 * and appends `?pgbouncer=true` when using a transaction pooler (port 6543 / Supabase pooler)
 * to prevent `42P05: prepared statement "s0" already exists` errors.
 */
function normalizeDatabaseUrl(rawUrl: string): string {
  try {
    let url = rawUrl.trim();
    const schemeMatch = url.match(/^(postgresql:\/\/|postgres:\/\/)(.*)$/i);
    if (!schemeMatch) return url;
    const scheme = schemeMatch[1];
    const rest = schemeMatch[2];
    const lastAtIndex = rest.lastIndexOf('@');
    if (lastAtIndex !== -1) {
      const credentials = rest.slice(0, lastAtIndex);
      const hostAndDb = rest.slice(lastAtIndex + 1);
      const colonIndex = credentials.indexOf(':');
      if (colonIndex !== -1) {
        const user = credentials.slice(0, colonIndex);
        const rawPassword = credentials.slice(colonIndex + 1);
        const encodedPassword = rawPassword.includes('@')
          ? rawPassword.replace(/@/g, '%40')
          : rawPassword;
        url = `${scheme}${user}:${encodedPassword}@${hostAndDb}`;
      }
    }

    // Ensure pgbouncer=true is enabled for transaction poolers (port 6543 / pooler.supabase.com)
    if (
      (url.includes(':6543') || url.includes('pooler.supabase.com')) &&
      !url.includes('pgbouncer=true')
    ) {
      url += url.includes('?') ? '&pgbouncer=true' : '?pgbouncer=true';
    }

    return url;
  } catch {
    return rawUrl;
  }
}

const normalizedDbUrl = normalizeDatabaseUrl(config.DATABASE_URL);

export const prisma =
  global.__prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: normalizedDbUrl,
      },
    },
    log: config.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (config.NODE_ENV !== 'production') {
  global.__prisma = prisma;
}

let dbLiveState: boolean | null = null;

export function isDatabaseLive(): boolean {
  if (process.env.NODE_ENV === 'test') {
    return false;
  }
  return dbLiveState !== false;
}

export function markDatabaseOffline(err?: any): void {
  if (dbLiveState !== false) {
    dbLiveState = false;
    if (process.env.NODE_ENV !== 'test') {
      const reason = err?.message ? err.message.split('\n').pop() : 'Connection failed';
      console.warn(`[DB] PostgreSQL unreachable (${reason}). Switched to fast in-memory store.`);
    }
  }
}

export async function checkDatabaseHealth(): Promise<{ connected: boolean; message?: string }> {
  if (process.env.NODE_ENV === 'test') {
    dbLiveState = false;
    return { connected: false, message: 'Test mode (in-memory store)' };
  }
  try {
    await Promise.race([
      prisma.$queryRawUnsafe('SELECT 1'),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Database connection timeout (3s)')), 3000)
      ),
    ]);
    dbLiveState = true;
    return { connected: true };
  } catch (error: any) {
    markDatabaseOffline(error);
    return {
      connected: false,
      message: error?.message || 'Database unreachable',
    };
  }
}
