
'use server';

import { getLogs, clearAllLogs as clearLogsFromFile, type Logs, type LogEntry } from '@/lib/logger';

// WARNING: Credentials should be set in environment variables for production.
// Fallbacks are provided for ease of development, but should not be relied upon in production.
const ADMIN_USERNAME_ENV = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD_ENV = process.env.ADMIN_PASSWORD;

const ADMIN_USERNAME_FALLBACK = 'service@ohya.co';
const ADMIN_PASSWORD_FALLBACK = '2-JgudxoU,10331924';

const ADMIN_USERNAME = ADMIN_USERNAME_ENV || ADMIN_USERNAME_FALLBACK;
const ADMIN_PASSWORD = ADMIN_PASSWORD_ENV || ADMIN_PASSWORD_FALLBACK;

interface AuthAndLogsResponse {
  success: boolean;
  logs?: Logs;
  error?: string;
}

interface ClearLogsResponse {
  success: boolean;
  error?: string;
}

function checkCredentialsSet() {
  if (!ADMIN_USERNAME_ENV || !ADMIN_PASSWORD_ENV) {
    console.warn(
      "WARNING: Admin credentials are not set in environment variables (ADMIN_USERNAME, ADMIN_PASSWORD). " +
      "Using insecure fallback credentials. Please set these in your .env file or hosting environment for production."
    );
  }
}

export async function authenticateAndFetchLogs(credentials: {
  username?: string;
  password?: string;
}): Promise<AuthAndLogsResponse> {
  checkCredentialsSet();
  if (credentials.username === ADMIN_USERNAME && credentials.password === ADMIN_PASSWORD) {
    try {
      const logs = await getLogs();
      return { success: true, logs };
    } catch (error: any) {
      console.error("Error fetching logs:", error);
      return { success: false, error: "Failed to fetch logs." };
    }
  } else {
    return { success: false, error: 'Invalid credentials.' };
  }
}

export async function authenticateAndClearLogs(credentials: {
  username?: string;
  password?: string;
}): Promise<ClearLogsResponse> {
  checkCredentialsSet();
  if (credentials.username === ADMIN_USERNAME && credentials.password === ADMIN_PASSWORD) {
    try {
      await clearLogsFromFile();
      return { success: true };
    } catch (error: any) {
      console.error("Error clearing logs:", error);
      return { success: false, error: "Failed to clear logs." };
    }
  } else {
    return { success: false, error: 'Invalid credentials for clearing logs.' };
  }
}

