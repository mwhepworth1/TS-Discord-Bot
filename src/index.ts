import { Client, Collection, EmbedBuilder, GatewayIntentBits, Partials } from 'discord.js';
import config from './data/settings.json';
import { loadSettings, query } from './data/db/mysql';
import { EmbedMessages } from './data/messages';
import { Command, Addon } from './types/interfaces';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';

let embedMessage: EmbedMessages | undefined; // Use "| undefined" to allow for the possibility of it being undefined

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.DirectMessages
    ],
    partials: [
        Partials.Channel,
        Partials.Message,
    ]
});

async function startCanvasAPITask() {
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

    setTimeout(async () => {
        try {
            // Get all users with API keys from database
            const users = await query('SELECT * FROM bot_settings WHERE apikey != "NONE"');
            
            for (const user of users) {
                if (!user.apikey || user.apikey === 'NONE') continue;

                const api = "https://byui.instructure.com/api/v1/";
                const token = user.apikey;

                // Log courses API access
                console.log(`[API] /v1/courses accessed on behalf of ${user.discord_id}`);
                // Get courses
                const coursesResponse = await axios.get(`${api}courses`, {
                    params: {
                        access_token: token,
                        include: 'total_scores',
                        per_page: 100,
                        enrollment_term_id: 411
                    }
                });

                // Process each course
                for (const course of coursesResponse.data) {
                    if (!course.name || course.grading_standard_id === null) continue;

                    // Log upcoming assignments API access
                    console.log(`[API] /v1/courses/${course.id}/assignments (upcoming) accessed on behalf of ${user.discord_id}`);
                    // Get upcoming assignments
                    const upcomingResponse = await axios.get(`${api}courses/${course.id}/assignments`, {
                        params: {
                            include: ['submission'],
                            bucket: 'upcoming',
                            order_by: 'due_at',
                            access_token: token
                        }
                    });

                    // Log past assignments API access
                    console.log(`[API] /v1/courses/${course.id}/assignments (past) accessed on behalf of ${user.discord_id}`);
                    // Get past assignments
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

                    // Update database
                    await query(
                        `INSERT INTO api (course_name, course_code, course_score, course_letter_grade, upcoming_assignments, past_assignments, discord_id)
                         SELECT ?, ?, ?, ?, ?, ?, ?
                         FROM DUAL
                         WHERE NOT EXISTS (
                             SELECT 1 FROM api
                             WHERE course_name = ?
                               AND course_code = ?
                               AND course_score = ?
                               AND course_letter_grade = ?
                               AND upcoming_assignments = ?
                               AND past_assignments = ?
                               AND discord_id = ?
                         )`,
                        [
                            course.name,
                            course.course_code,
                            course.enrollments[0].computed_current_score,
                            course.enrollments[0].computed_current_grade,
                            upcomingAssignments,
                            pastAssignments,
                            user.discord_id,
                            // Repeat values for the NOT EXISTS check:
                            course.name,
                            course.course_code,
                            course.enrollments[0].computed_current_score,
                            course.enrollments[0].computed_current_grade,
                            upcomingAssignments,
                            pastAssignments,
                            user.discord_id
                        ]
                    );
                }
            }
        } catch (error) {
            console.error('Error in Canvas API task:', error);
        }
    }, 1000 * 60 * 10); // Run every 10 mins
}

client.on('ready', () => {
  if (client.user && client.user.tag) {
    console.log(`Logged in as ${client.user.tag}!`);
  } else {
    console.log(`Logged in, but client.user.tag (or client.user) is undefined.`);
  }
  startCanvasAPITask();
  console.log('Started Canvas API background task');
});

const commands = new Collection<string, Command>();

// Load commands
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const { command } = require(path.join(commandsPath, file));
    commands.set(command.name, command);
}

client.on('messageCreate', async message => {
    console.log(`Message received: ${message.content}`);
    if (!message.content.startsWith(config.prefix)) return;
    console.log(`Message starts with prefix: ${config.prefix}`);
    if (message.author.bot) return;
    console.log(`Message author is not a bot`);

    const args: string[] = message.content.slice(config.prefix.length).trim().split(/ +/);
    const commandName: string = args[0];

    console.log(`Command name: ${commandName}`);

    const command = commands.get(commandName);
    if (!command) {
        console.log(`Command not found: ${commandName}`);
        return
    };

    try {
        const settings = await loadSettings(message.author.id);
        await command.execute(message, args, settings[0]);
    } catch (error) {
        console.error(error);
        message.reply('There was an error executing that command!');
    }
});

client.login(config.token);