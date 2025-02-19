import { DMChannel, Message } from 'discord.js';
import { Command } from '../types/interfaces';
import { Settings } from '../data/user-settings';
import { EmbedMessages, embedMessage } from '../data/messages';
import { showLink, loadUpcoming } from '../data/db/mysql';

type AssignmentInfo = [string, string, string];

export const command: Command = {
    name: 'upcoming',
    async execute(message: Message, args: string[], userSettings: Settings) {
        const dm = message.channel as DMChannel;

        showLink(message.author.id).then((res) => {
            loadUpcoming(message.author.id).then((r) => {
                let embed = embedMessage?.school?.upcoming,
                    fieldArr = [];
                embed.color = parseInt(userSettings.color, 16);

                for (let x = 0; x < r.length; x++) {
                    let v = r[x].upcoming_assignments.split("\n");

                    for (let y = 0; y < v.length; y++) {
                        v[y] = v[y].split("_");
                        if (v[y] == '') {
                            v.pop(y);
                            y--;
                        }
                    }

                    for (let g = 0; g < v.length; g++) {
                        const [name, date, link]: AssignmentInfo = [v[g][0], v[g][1], v[g][2]];

                        let str = `\n**${name}** \n*__DUE: ${date}__* \n${link}`;
                        if (r[x].upcoming_assignments == '') r[x].upcoming_assignments = "No new assignments for the next 7 days!";
                        if (!name) str = 'No upcoming assignments :smile:';
                        if (res[0].showlinks === 'NO') str = `\n**${name}** \n*__DUE: ${date}__*`;
                        fieldArr.push({
                            name: `**${r[x].course_name} | ${r[x].course_code}**`,
                            value: str,
                        });
                    }

                }
                embed.fields = fieldArr;
                dm.send({ embeds: [embed] });
            });
        });
    }
};
