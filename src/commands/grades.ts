import { DMChannel, Message } from 'discord.js';
import { Command } from '../types/interfaces';
import { Settings } from '../data/user-settings';
import { EmbedMessages, embedMessage } from '../data/messages';
import { loadGrades, showGrades } from '../data/db/mysql';

export const command: Command = {
    name: 'grades',
    async execute(message: Message, args: string[], userSettings: Settings) {
        const dm = message.channel as DMChannel;

        showGrades(message.author.id).then((res) => {
            if (res[0].showgrades === "NO") {
                let embed = embedMessage?.school?.noGradesPerm;
                embed.color = parseInt(userSettings.color, 16);
                dm.send({ embeds: [embed] });
            } else {
                loadGrades(message.author.id).then((r) => {
                    let embed = embedMessage.school.grades,
                        fieldArr = [];
                    embed.color = parseInt(userSettings.color, 16);

                    for (let x = 0; x < r.length; x++) {
                        if (r[x].course_letter_grade == null) r[x].course_letter_grade = "N/A";
                        if (r[x].course_score == null) r[x].course_score = "N/A";
                        fieldArr.push({
                            name: `**${r[x].course_name}: ${r[x].course_letter_grade}**`,
                            value: `Computed Score: ${r[x].course_score}`,
                            inline: true
                        })
                    }
                    embed.fields = fieldArr;
                    dm.send({ embeds: [embed] });
                });
            }
        });
    }
};
