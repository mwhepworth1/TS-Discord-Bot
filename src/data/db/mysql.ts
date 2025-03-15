import mysql from 'mysql';
import { userSettings } from '../user-settings';
import util from 'util';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

console.log(process.env.HOST);
console.log(process.env.USER);


const pool = mysql.createPool({
    connectionLimit: 20,
    host: process.env.HOST!, // Non null assertion
    user: process.env.USER!,
    password: process.env.PSWD!,
    database: process.env.DB!
});

// Type the promisified function so that it returns a Promise<any>
export const query: (sql: string, values?: any[]) => Promise<any> = util.promisify(pool.query).bind(pool);

export async function loadSettings(userID: string): Promise<any[]> {
    try {
        const result = await query('SELECT * FROM bot_settings WHERE discord_id = ?', [userID]);
        console.log('SEARCHED DATABASE FOR CURRENT USER.');
        if (!result[0]) {
            console.log(`Creating new user in the database.`);
            await query(
                `INSERT INTO bot_settings (discord_id, color, showlinks, showgrades, pastgrades, apikey) VALUES (?, ?, ?, ?, ?, 'NONE')`,
                [
                  userID, 
                  userSettings.defaults.color.split('`')[1],
                  userSettings.defaults.links.split('`')[1],
                  userSettings.defaults.grades.split('`')[1],
                  userSettings.defaults.recentGrades
                ]
            );
            const newUser = await query('SELECT color, showlinks, showgrades, pastgrades, apikey FROM bot_settings WHERE discord_id = ?', [userID]);
            return newUser;
        }
        return result;
    } catch (error: any) {
        console.error(error);
        throw error;
    }
}

export async function setColor(userID: string, color: string): Promise<void> {
    try {
        await query('UPDATE bot_settings SET color = ? WHERE discord_id = ?', [color, userID]);
        console.log('Set color of user: ' + userID);
    } catch (error: any) {
        console.error(error);
        throw error;
    }
}

export async function setHistory(userID: string, n: number): Promise<void> {
    try {
        await query('UPDATE bot_settings SET pastgrades = ? WHERE discord_id = ?', [n, userID]);
        console.log('Set grade history of user: ' + userID);
    } catch (error: any) {
        console.error(error);
        throw error;
    }
}

export async function addKey(userID: string, key: string): Promise<void> {
    try {
        await query('UPDATE bot_settings SET apikey = ? WHERE discord_id = ?', [key, userID]);
        console.log('Added API key for user: ' + userID);
        
    } catch (error: any) {
        console.error(error);
        throw error;
    }
}

export async function linkVisibility(userID: string, v: string): Promise<void> {
    try {
        await query('UPDATE bot_settings SET showlinks = ? WHERE discord_id = ?', [v, userID]);
        console.log('Updated Link Visibility for user: ' + userID);
    } catch (error: any) {
        console.error(error);
        throw error;
    }
}

export async function gradeVisibility(userID: string, v: string): Promise<void> {
    try {
        await query('UPDATE bot_settings SET showgrades = ? WHERE discord_id = ?', [v, userID]);
        console.log('Updated Grade Visibility for user: ' + userID);
    } catch (error: any) {
        console.error(error);
        throw error;
    }
}

export async function loadGrades(userID: string): Promise<any[]> {
    try {
        const result = await query('SELECT course_name, course_letter_grade, course_score FROM api WHERE discord_id = ?', [userID]);
        console.log('SEARCHED API DATABASE FOR CURRENT USER.');
        if (!result[0]) return [];
        return result;
    } catch (error: any) {
        console.error(error);
        throw error;
    }
}

export async function loadUpcoming(userID: string): Promise<any[]> {
    try {
        const result = await query('SELECT course_name, course_code, upcoming_assignments FROM api WHERE discord_id = ?', [userID]);
        console.log('SEARCHED API DATABASE FOR CURRENT USER.');
        if (!result[0]) return [];
        return result;
    } catch (error: any) {
        console.error(error);
        throw error;
    }
}

export async function showLink(userID: string): Promise<any[]> {
    try {
        const result = await query('SELECT showlinks FROM bot_settings WHERE discord_id = ?', [userID]);
        console.log('SEARCHED BOT_SETTINGS DATABASE FOR CURRENT USER.');
        if (!result[0]) return [];
        return result;
    } catch (error: any) {
        console.error(error);
        throw error;
    }
}

export async function showGrades(userID: string): Promise<any[]> {
    try {
        const result = await query('SELECT showgrades FROM bot_settings WHERE discord_id = ?', [userID]);
        console.log('SEARCHED BOT_SETTINGS DATABASE FOR CURRENT USER.');
        if (!result[0]) return [];
        return result;
    } catch (error: any) {
        console.error(error);
        throw error;
    }
}

export async function showGradeHistory(userID: string): Promise<any[]> {
    try {
        const result = await query('SELECT showgrades, pastgrades, showlinks FROM bot_settings WHERE discord_id = ?', [userID]);
        console.log('SEARCHED BOT_SETTINGS DATABASE FOR CURRENT USER.');
        if (!result[0]) return [];
        return result;
    } catch (error: any) {
        console.error(error);
        throw error;
    }
}

export async function pastAssignments(userID: string): Promise<any[]> {
    try {
        const result = await query('SELECT api.course_name, api.course_code, api.past_assignments, bot_settings.pastgrades FROM api INNER JOIN bot_settings ON api.discord_id = bot_settings.discord_id WHERE api.discord_id = ?', [userID]);
        console.log('SEARCHED BOT_SETTINGS DATABASE FOR CURRENT USER.');
        if (!result[0]) return [];
        return result;
    } catch (error: any) {
        console.error(error);
        throw error;
    }
}

export async function dndToggle(userID: string, status: string): Promise<void> {
    try {
        await query('UPDATE bot_settings SET dnd = ? WHERE discord_id = ?', [status, userID]);
        console.log('Set DND status of user: ' + userID);
    } catch (error: any) {
        console.error(error);
        throw error;
    }
}