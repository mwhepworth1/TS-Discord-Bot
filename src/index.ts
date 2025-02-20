
// Running this file in PS:
// " clear && npx tsc && node dist/index.js "

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
            const users = await query('SELECT * FROM bot_settings WHERE apikey != "NONE"');
            
            for (const user of users) {
                if (!user.apikey || user.apikey === 'NONE') continue;

                const api = "https://byui.instructure.com/api/v1/";
                const token = user.apikey;

                console.log(`[API] /v1/courses accessed on behalf of ${user.discord_id}`);
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
                        console.log(`[API] Skipping course ${course.course_code} as it is not Winter 2025 (TERM: ${course.term.name})`);
                        continue;
                    };

                    console.log(`[API] Upcoming assignments for ${course.course_code} accessed on behalf of ${user.discord_id}`);
                    const upcomingResponse = await axios.get(`${api}courses/${course.id}/assignments`, {
                        params: {
                            include: ['submission'],
                            bucket: 'upcoming',
                            order_by: 'due_at',
                            access_token: token
                        }
                    });

                    console.log(`[API] Past assignments for ${course.course_code} accessed on behalf of ${user.discord_id}`);
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
        console.log('[API] Canvas API task completed.');
    }, 1000 * 5); // Run every 10 mins = 1000 * 60 * 10
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

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const { command } = require(path.join(commandsPath, file));
    commands.set(command.name, command);
}

client.on('messageCreate', async message => {
    if (!message.content.startsWith(config.prefix)) return;
    if (message.author.bot) return;

    const args: string[] = message.content.slice(config.prefix.length).trim().split(/ +/);
    const commandName: string = args[0];


    const command = commands.get(commandName);
    if (!command) {
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