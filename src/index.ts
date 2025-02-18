import { Client, GatewayIntentBits, Message } from 'discord.js'; 
import { config } from 'dotenv';

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

config();

client.on('ready', () => {
    if (client.user) {
        console.log(`Logged in as ${client.user.tag}!`);
    } else {
        console.log('Logged in, but client.user is null.');
    }
});

client.on('messageCreate', (message: Message) => {
    if (message.content === '!ping') {
        message.reply('pong');
    }
});

client.login(process.env.BOT_TOKEN);