import { Client, Collection, EmbedBuilder, GatewayIntentBits, Partials } from 'discord.js';
import config from 'settings.json';
import { checkTableExists, createTable, loadSettings } from './addons/data/server';
import chokidar from 'chokidar';
import { Settings } from './addons/user-settings';

interface Addon {
    embedMessage: EmbedBuilder;
}

let embedMessage: EmbedBuilder | undefined;

const watcher = chokidar.watch('./addons/messages.ts');

const reRequireModule = (): void => {
    try {
        delete require.cache[require.resolve('./addons/messages.ts')];
        const addon: Addon = require('./addons/messages.ts');
        embedMessage = addon.embedMessage;
        console.log('Imported new messages.ts');
    } catch (e) {
        console.error('Failed to import new messages.ts', e);
    }
}

// Initialize
reRequireModule();

watcher.on('change', () => {
    reRequireModule();
});

setTimeout(() => {
    if (embedMessage) {
        console.log('Successfully loaded messages');
    } else {
        console.error('Failed to load messages');
    }
}, 1000);

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

  console.log(`Running Database Checks.`);

  checkTableExists('bot_settings').then(exists => {
    if (!exists) {
      console.log('Table "bot_settings" does not exist.');
      createTable('bot_settings').then(() => {
        console.log('Created table: "bot_settings".');
      });
    }
  });

  checkTableExists('api').then(exists => {
    if (!exists) {
      console.log('Table "api" does not exist.');
      createTable('api').then(() => {
        console.log('Created table: "api".');
      });
    }
  });
});

client.on('messageCreate', async message => {
    if (message.content.startsWith(config.prefix)) {
        const args: string[] = message.content.slice(config.prefix.length).trim().split(/ +/);
        const command: string = args[0];
        if (message.author.bot === true) return;
        loadSettings(message.author.id).then(async (settings: Settings[]) => {
            const userSettings: Settings = settings[0];
            let color: number = parseInt(userSettings.color, 16);
            if (message.guildId != null) {
                switch(command) {
                    case 'help':
                        message.channel.send({embeds: embedMessage?.guilds?.helpEmbed});
                }
            } else if (message.guildId === null) {
                switch (command) {
                    case 'help':
                        let embed = embedMessage?.direct?.helpEmbed;
                }
            }
        });
    }
});