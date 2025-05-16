
'use server';

import fs from 'fs/promises';
import path from 'path';

export interface LogEntry {
  timestamp: string;
  url: string;
  keywords?: string[];
  peopleAlsoAsk?: Array<{ question: string; snippet?: string; title?: string; link?: string }>;
  faqSchema?: string;
  plainTextFaq?: string; // Added for plain text FAQ logging
  error?: string;
}

export type Logs = LogEntry[];

const LOG_FILE_PATH = path.join(process.cwd(), 'admin_logs.json');

async function ensureLogFile(): Promise<void> {
  try {
    await fs.access(LOG_FILE_PATH);
  } catch (error) {
    try {
      await fs.writeFile(LOG_FILE_PATH, JSON.stringify([], null, 2), 'utf-8');
      console.log('Log file created successfully at:', LOG_FILE_PATH);
    } catch (writeError) {
      console.error('Error creating log file (ensureLogFile could not write to ' + LOG_FILE_PATH + '):', writeError);
      // Allow getLogs to attempt a read.
    }
  }
}

export async function getLogs(): Promise<Logs> {
  await ensureLogFile();
  try {
    const fileContent = await fs.readFile(LOG_FILE_PATH, 'utf-8');
    const logs = JSON.parse(fileContent) as Logs;
    return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  } catch (error) {
    console.error('Error reading log file (getLogs from ' + LOG_FILE_PATH + '):', error);
    return [];
  }
}

export async function addLogEntry(entry: Omit<LogEntry, 'timestamp'>): Promise<void> {
  await ensureLogFile();
  let logs: Logs = [];
  try {
    const fileContent = await fs.readFile(LOG_FILE_PATH, 'utf-8');
    logs = JSON.parse(fileContent) as Logs;
  } catch (readError) {
    console.warn('Could not read existing logs in addLogEntry, starting with new log list for ' + LOG_FILE_PATH + ':', readError);
    logs = [];
  }
  
  const newEntry: LogEntry = {
    timestamp: new Date().toISOString(),
    ...entry,
  };
  logs.unshift(newEntry);

  try {
    await fs.writeFile(LOG_FILE_PATH, JSON.stringify(logs, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing to log file (addLogEntry to ' + LOG_FILE_PATH + '):', error);
  }
}

export async function clearAllLogs(): Promise<void> {
  try {
    await fs.writeFile(LOG_FILE_PATH, JSON.stringify([], null, 2), 'utf-8');
    console.log('Log file cleared successfully at:', LOG_FILE_PATH);
  } catch (error) {
    console.error('Error clearing log file (clearAllLogs for ' + LOG_FILE_PATH + '):', error);
  }
}
