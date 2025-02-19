import { Client, Collection, EmbedBuilder, GatewayIntentBits, Partials } from 'discord.js';
import config from './data/settings.json';
import { loadSettings } from './data/db/mysql';
import { EmbedMessages } from './data/messages';
import { Command, Addon } from './types/interfaces';
import * as fs from 'fs';
import * as path from 'path';

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