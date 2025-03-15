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
import { initializeScheduler, triggerAllUsersDataRefresh } from './data/canvas-api/scheduler';

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

client.on('ready', () => {
  if (client.user && client.user.tag) {
    console.log(`Logged in as ${client.user.tag}!`);
  } else {
    console.log(`Logged in, but client.user.tag (or client.user) is undefined.`);
  }
  
  // Initialize the scheduler for Canvas API data refresh
  initializeScheduler();
  console.log('Canvas API scheduler initialized');
  
  // Trigger an initial data refresh for all users
  triggerAllUsersDataRefresh();
  console.log('Initial Canvas API data refresh triggered');
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