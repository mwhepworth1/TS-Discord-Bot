import axios from 'axios';
import { query, getApiKey, encrypt, decrypt } from '../db/mysql';

// Interface definitions for Canvas API data
interface Assignment {
  name: string;
  html_url: string;
  submission: {
    score: number | null;
  };
  points_possible: number;
  score_statistics?: {
    mean: number | null;
  };
}

interface UpcomingAssignment {
  name: string;
  due_at: string;
  html_url: string;
  submission: {
    submitted_at: string | null;
  };
}

/**
 * Process Canvas data for all users with API keys
 */
export async function fetchCanvasDataForAllUsers(): Promise<void> {
  try {
    const users = await query('SELECT * FROM bot_settings WHERE apikey != "NONE"');
    console.log(`[API] Processing Canvas data for ${users.length} users`);
    
    for (const user of users) {
      await fetchCanvasDataForUser(user.discord_id);
    }
  } catch (error) {
    console.error('[API] Error processing Canvas data for all users:', error);
  }
}

/**
 * Process Canvas data for a single user
 * @param userId Discord user ID
 */
export async function fetchCanvasDataForUser(userId: string): Promise<void> {
  console.log(`[API] Processing Canvas data for user ${userId}`);
  
  try {
    // Get and decrypt the API key
    const apiKey = await getApiKey(userId);
    if (!apiKey) {
      console.log(`No API key available for user ${userId}`);
      return;
    }
    
    // Use the decrypted API key for Canvas API calls
    const token = apiKey;
    
    await query('DELETE FROM api WHERE discord_id = ?', [userId]);
    console.log(`[API] Deleted existing Canvas data for user ${userId}`);
    
    const api = "https://byui.instructure.com/api/v1/";
    
    console.log(`[API] /v1/courses accessed on behalf of ${userId}`);
    const coursesResponse = await axios.get(`${api}courses`, {
      params: {
        access_token: token,
        include: ['total_scores', 'term'],
        per_page: "100",
      }
    });
    
    for (const course of coursesResponse.data) {
      if (!course.name || !course.course_code) continue;
      if (course.enrollment_term_id != "411") {
        console.log(`[API] Skipping course ${course.course_code} as it is not Winter 2025 (TERM: ${course.term?.name})`);
        continue;
      };
      
      console.log(`[API] Upcoming assignments for ${course.course_code} accessed on behalf of ${userId}`);
      const upcomingResponse = await axios.get(`${api}courses/${course.id}/assignments`, {
        params: {
          include: ['submission'],
          bucket: 'upcoming',
          order_by: 'due_at',
          access_token: token
        }
      });
      
      console.log(`[API] Past assignments for ${course.course_code} accessed on behalf of ${userId}`);
      const pastResponse = await axios.get(`${api}courses/${course.id}/assignments`, {
        params: {
          include: ['submission', 'score_statistics'],
          bucket: 'past',
          per_page: 100,
          order_by: 'due_at',
          access_token: token
        }
      });
      
      const upcomingAssignments: string = upcomingResponse.data
        .filter((a: UpcomingAssignment) => !a.submission.submitted_at)
        .map((a: UpcomingAssignment) => {
          const dueDate: string = new Date(a.due_at).toLocaleString('en-US', { timeZone: 'America/Denver' });
          return `${a.name}_${dueDate}_${a.html_url}`;
        })
        .join('\n');
      
      const pastAssignments: string = pastResponse.data
        .map((a: Assignment) => {
          return `${a.name}_${a.html_url}_${a.submission.score || 'None'}_${a.points_possible}_${a.score_statistics?.mean || 'None'}`;
        })
        .join('\n');
      
      await storeCanvasData(userId, course, upcomingAssignments, pastAssignments);
      
      console.log(`[API] Saved data for course ${course.course_code} for user ${userId}`);
    }
    
    console.log(`[API] Completed processing Canvas data for user ${userId}`);
  } catch (error) {
    console.error(`[API] Error processing Canvas data for user ${userId}:`, error);
  }
}

// This would go in your processor.ts file or wherever you insert data into the API table
async function storeCanvasData(user: any, course: any, upcomingAssignments: string, pastAssignments: string): Promise<void> {
    try {
        // Encrypt sensitive data
        const encryptedUpcoming = encrypt(upcomingAssignments);
        const encryptedPast = encrypt(pastAssignments);
        
        await query(
            `INSERT INTO api (course_name, course_code, course_score, course_letter_grade, upcoming_assignments, past_assignments, discord_id) 
             VALUES (?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE 
             course_score = VALUES(course_score), 
             course_letter_grade = VALUES(course_letter_grade), 
             upcoming_assignments = VALUES(upcoming_assignments), 
             past_assignments = VALUES(past_assignments)`,
            [
                course.name,
                course.course_code,
                course.enrollments[0].computed_current_score,
                course.enrollments[0].computed_current_grade,
                encryptedUpcoming,
                encryptedPast,
                user
            ]
        );
    } catch (error) {
        console.error('Error storing encrypted Canvas data:', error);
        throw error;
    }
}
