import { Message, DMChannel } from 'discord.js';
import { Command } from '../types/interfaces';
import { Settings } from '../data/user-settings';
import { EmbedMessages, embedMessage } from '../data/messages';
import { addKey, setColor, linkVisibility, gradeVisibility, setHistory } from '../data/db/mysql';

export const command: Command = {
    name: 'settings',
    async execute(message: Message, args: string[], userSettings: Settings) {
        const color = parseInt(userSettings.color, 16);
        const dm = message.channel as DMChannel;

        if (args[1] === "set" && args[2] === "key" && args[3]) {
            addKey(message.author.id, args[3]).then(r => {
                const embed = embedMessage?.settings.setKey;
                if (embed) {
                    embed.color = color;
                    dm.send({ embeds: [embed] });
                }
            });
        } else if (args[1] === "set" && args[2] === "color" && args[3]) {
            setColor(message.author.id, args[3]).then(r => {
                const embed = embedMessage?.settings.setColor;
                if (embed) {
                    embed.color = color;
                    dm.send({ embeds: [embed] });
                }
            });
        } else if (args[1] === "set" && args[2] === "links" && args[3]) {
            if (args[3] === "show") {
                linkVisibility(message.author.id, "YES").then(r => {
                    const embed = embedMessage?.settings.setShowLinks;
                    if (embed) {
                        embed.color = color;
                        dm.send({ embeds: [embed] });
                    }
                });
            } else if (args[3] === "hide") {
                linkVisibility(message.author.id, "NO").then(r => {
                    const embed = embedMessage?.settings.setHideLinks;
                    if (embed) {
                        embed.color = color;
                        dm.send({ embeds: [embed] });
                    }
                });
            } else {
                const embed = embedMessage?.settings.invalidLinkSetting;
                if (embed) {
                    embed.color = color;
                    dm.send({ embeds: [embed] });
                }
            }
        } else if (args[1] === "set" && args[2] === "grades" && args[3]) {
            if (args[3] === "show") {
                gradeVisibility(message.author.id, "YES").then(r => {
                    const embed = embedMessage?.settings.setShowGrades;
                    if (embed) {
                        embed.color = color;
                        dm.send({ embeds: [embed] });
                    }
                });
            } else if (args[3] === "hide") {
                gradeVisibility(message.author.id, "NO").then(r => {
                    const embed = embedMessage?.settings.setHideGrades;
                    if (embed) {
                        embed.color = color;
                        dm.send({ embeds: [embed] });
                    }
                });
            } else {
                const embed = embedMessage?.settings.invalidGradeSetting;
                if (embed) {
                    embed.color = color;
                    dm.send({ embeds: [embed] });
                }
            }
        } else if (args[1] === "set" && args[2] === "history" && args[3]) {
            let historyValue = Number(args[3]);
            if (Number.isNaN(historyValue)) {
                historyValue = 14;
            }
            if (typeof historyValue === "number" && historyValue > 1 && historyValue < 15) {
                setHistory(message.author.id, historyValue).then(r => {
                    const embed = embedMessage?.settings.setHistory;
                    if (embed) {
                        embed.color = color;
                        embed.description = `The number of days your grade history will go back is \`${historyValue}\` days.`;
                        dm.send({ embeds: [embed] });
                    }
                });
            }
        } else if (args[1] === "set" && args[2] === "history") {
            const embed = embedMessage?.settings.changeHistory;
            if (embed) {
                embed.color = color;
                dm.send({ embeds: [embed] });
            }
        } else if (args[1] === "set" && args[2] === "key") {
            const embed = embedMessage?.settings.changeKey;
            if (embed) {
                embed.color = color;
                dm.send({ embeds: [embed] });
            }
        } else if (args[1] === "set" && args[2] === "color") {
            const embed = embedMessage?.settings.changeColor;
            if (embed) {
                embed.color = color;
                dm.send({ embeds: [embed] });
            }
        } else if (args[1] === "set" && args[2] === "links") {
            const embed = embedMessage?.settings.changeLinks;
            if (embed) {
                embed.color = color;
                dm.send({ embeds: [embed] });
            }
        } else if (args[1] === "set" && args[2] === "grades") {
            const embed = embedMessage?.settings.changeGrades;
            if (embed) {
                embed.color = color;
                dm.send({ embeds: [embed] });
            }
        } else if (args[1] === "set" && !args[2]) {
            const embed = embedMessage?.settings.changeSetting;
            if (embed) {
                embed.color = color;
                dm.send({ embeds: [embed] });
            }
        } else {
            const embed = embedMessage?.settings.mainEmbed;
            if (embed) {
                embed.color = color;
                if (userSettings.apiKey === "NONE" || userSettings.apiKey === undefined) {
                    embed.fields![0].value = `Please provide an API Key.`;
                } else {
                    embed.fields![0].value = `*This content is not displayed for security purposes.*`;
                }
                embed.fields![1].value = `\`${userSettings.color}\``;
                embed.fields![2].value = `\`${userSettings.links}\``;
                embed.fields![3].value = `\`${userSettings.grades}\``;
                embed.fields![4].value = `from the last \`${userSettings.recentGrades}\` days.`;
                dm.send({ embeds: [embed] });
            }
        }
    }
};
