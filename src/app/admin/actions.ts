
'use server';

import { getLogs, clearAllLogs as clearLogsFromFile, type Logs, type LogEntry } from '@/lib/logger';

// WARNING: Hardcoding credentials is not secure for production.
// Consider environment variables or a proper auth system.
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'service@ohya.co';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '2-JgudxoU,10331924';

interface AuthAndLogsResponse {
  success: boolean;
  logs?: Logs;
  error?: string;
}

interface ClearLogsResponse {
  success: boolean;
  error?: string;
}

export async function authenticateAndFetchLogs(credentials: {
  username?: string;
  password?: string;
}): Promise<AuthAndLogsResponse> {
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
