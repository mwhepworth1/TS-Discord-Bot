import cron from 'node-cron';
import { query } from '../db/mysql';
import { fetchCanvasDataForUser, fetchCanvasDataForAllUsers } from './processor.js';

/**
 * Schedule Canvas API data refresh to run at specific times
 * For testing purposes only, it runs every 2 minutes.
 */
export function initializeScheduler(): void {
  // Schedule job to run at 3:30 PM every day
  // For 30 minute intervals, use '*/30 * * * *'
  // For every hour, use '0 * * * *'

  /**
   * CRON Breakdown: (Provided by Claude 3.7 via GitHub Copilot)
   *    ┌───────────── minute (0 - 59)
   *    │ ┌───────────── hour (0 - 23)
   *    │ │ ┌───────────── day of the month (1 - 31)
   *    │ │ │ ┌───────────── month (1 - 12)
   *    │ │ │ │ ┌───────────── day of the week (0 - 6) (Sunday to Saturday)
   *    │ │ │ │ │                                   
   *    │ │ │ │ │
   *    │ │ │ │ │
   *    * * * * *
   */
  
  const dailyRefreshJob = cron.schedule('*/2 * * * *', async () => { 
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
