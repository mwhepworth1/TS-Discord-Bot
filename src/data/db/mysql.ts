import mysql from 'mysql';
import { userSettings } from '../user-settings';
import util from 'util';
import dotenv from 'dotenv';
import path from 'path';
import crypto from 'crypto';

dotenv.config();

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
const IV_LENGTH = 16; // For AES, this is always 16
const AUTH_TAG_LENGTH = 16; // For AES GCM, this is always 16
const pool = mysql.createPool({
    connectionLimit: 20,
    host: process.env.HOST!, // Non null assertion
    user: process.env.USER!,
    password: process.env.PSWD!,
    database: process.env.DB!
});

/**
 * Encrypts text using AES-256-GCM
 * @param text - The text to encrypt
 * @returns The encrypted text as a base64 string with IV and auth tag
 */
export function encrypt(text: string): string {
    if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length < 32) {
        throw new Error('ENCRYPTION_KEY must be at least 32 characters in .env file');
    }

    // Create a new IV for each encryption
    const iv = crypto.randomBytes(IV_LENGTH);

    // Create cipher
    const cipher = crypto.createCipheriv(
        'aes-256-gcm',
        Buffer.from(ENCRYPTION_KEY.slice(0, 32)),
        iv
    );

    // Encrypt the text
    let encrypted = cipher.update(text, 'utf8');
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    // Get authentication tag
    const authTag = cipher.getAuthTag();

    // Concatenate IV, encrypted data, and auth tag and convert to base64
    return Buffer.concat([iv, encrypted, authTag]).toString('base64');
}

/**
 * Decrypts text using AES-256-GCM
 * @param encryptedText - The text to decrypt (base64 encoded)
 * @returns The decrypted text
 */
export function decrypt(encryptedText: string): string {
    if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length < 32) {
        throw new Error('ENCRYPTION_KEY must be at least 32 characters in .env file');
    }

    // Convert from base64 to buffer
    const buffer = Buffer.from(encryptedText, 'base64');

    // Extract IV, encrypted content, and auth tag
    const iv = buffer.slice(0, IV_LENGTH);
    const authTag = buffer.slice(buffer.length - AUTH_TAG_LENGTH);
    const encrypted = buffer.slice(IV_LENGTH, buffer.length - AUTH_TAG_LENGTH);

    // Create decipher
    const decipher = crypto.createDecipheriv(
        'aes-256-gcm',
        Buffer.from(ENCRYPTION_KEY.slice(0, 32)),
        iv
    );

    // Set auth tag
    decipher.setAuthTag(authTag);

    // Decrypt the data
    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString('utf8');
}


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

// Update addKey to encrypt the API key before storing it
export async function addKey(userID: string, key: string): Promise<void> {
    try {
        // Encrypt the API key before storing
        const encryptedKey = encrypt(key);
        await query('UPDATE bot_settings SET apikey = ? WHERE discord_id = ?', [encryptedKey, userID]);
        console.log('Added encrypted API key for user: ' + userID);
    } catch (error: any) {
        console.error(error);
        throw error;
    }
}

// Add a new function to retrieve and decrypt an API key
export async function getApiKey(userID: string): Promise<string | null> {
    try {
        const result = await query('SELECT apikey FROM bot_settings WHERE discord_id = ?', [userID]);
        if (!result[0] || !result[0].apikey || result[0].apikey === 'NONE') {
            return null;
        }
        
        // Decrypt the API key before returning it
        return decrypt(result[0].apikey);
    } catch (error: any) {
        console.error('Error retrieving API key:', error);
        return null;
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
        
        // Decrypt the upcoming_assignments for each row
        return result.map((row: any) => ({
            ...row,
            upcoming_assignments: row.upcoming_assignments ? decrypt(row.upcoming_assignments) : ''
        }));
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
        
        // Decrypt the past_assignments for each row
        return result.map((row: any) => ({
            ...row,
            past_assignments: row.past_assignments ? decrypt(row.past_assignments) : ''
        }));
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