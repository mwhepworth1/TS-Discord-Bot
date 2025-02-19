import { ChatInputCommandInteraction, Message } from 'discord.js';
import { Settings } from '../data/user-settings';
import { EmbedMessages } from '../data/messages';

export interface Command {
    name: string;
    execute(interaction: Message, args: string[], userSettings: Settings): Promise<void>;
}

export interface Addon {
    embedMessage: EmbedMessages;
}
