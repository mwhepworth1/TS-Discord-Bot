import cron from 'node-cron';
import { query } from '../db/mysql';
import { fetchCanvasDataForUser, fetchCanvasDataForAllUsers } from './processor.js';

/**
 * Schedule Canvas API data refresh to run at specific times
 * By default, it refreshes data daily at 1:00 AM
 */
export function initializeScheduler(): void {
  // Schedule job to run at 3:30 PM every day
  // For 30 minute intervals, use '*/30 * * * *'
  // For every hour, use '0 * * * *'
  
  const dailyRefreshJob = cron.schedule('30 15 * * *', async () => { 
    console.log('[CRON] Starting scheduled Canvas API data refresh');
    await fetchCanvasDataForAllUsers();
    console.log('[CRON] Completed scheduled Canvas API data refresh');
  });

  // Start the job
  dailyRefreshJob.start();

  console.log('[CRON] Canvas API scheduler initialized');
}

/**
 * Manually trigger a data refresh for a specific user
 * @param userId Discord user ID
 */
export async function triggerUserDataRefresh(userId: string): Promise<void> {
  console.log(`[CRON] Manually triggering data refresh for user: ${userId}`);
  await fetchCanvasDataForUser(userId);
}

/**
 * Manually trigger a data refresh for all users with API keys
 */
export async function triggerAllUsersDataRefresh(): Promise<void> {
  console.log('[CRON] Manually triggering data refresh for all users');
  await fetchCanvasDataForAllUsers();
}
