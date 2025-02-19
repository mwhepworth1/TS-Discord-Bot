import { DMChannel, Message } from 'discord.js';
import { Command } from '../types/interfaces';
import { Settings } from '../data/user-settings';
import { EmbedMessages, embedMessage } from '../data/messages';
import { addKey, setColor, linkVisibility, gradeVisibility, setHistory } from '../data/db/mysql';

export const command: Command = {
    name: 'help',
    async execute(message: Message, args: string[], userSettings: Settings) {
        const dm = message.channel as DMChannel;
        if (message.guildId) {
            const helpEmbed = embedMessage?.guilds?.helpEmbed;
            if (helpEmbed) {
                dm.send({embeds: [helpEmbed]});
            }
        } else {
            let embed = embedMessage?.direct?.helpEmbed;
            if (embed) {
                embed.color = parseInt(userSettings.color, 16);
                dm.send({embeds: [embed]});
            }
        }
    }
};
