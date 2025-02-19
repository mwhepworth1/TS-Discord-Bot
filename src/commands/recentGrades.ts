import { DMChannel, Message } from 'discord.js';
import { Command } from '../types/interfaces';
import { Settings } from '../data/user-settings';
import { EmbedMessages } from '../data/messages';
import { showGradeHistory, addKey, setColor, linkVisibility, gradeVisibility, setHistory, pastAssignments } from '../data/db/mysql';

declare const embedMessage: EmbedMessages;

export const command: Command = {
    name: 'recentgrades',
    async execute(message: Message, args: string[], userSettings: Settings) {
        const dm = message.channel as DMChannel;

        showGradeHistory(message.author.id).then((res) => {
            if (res[0].showGrades === "NO") {
                let embed = embedMessage?.school?.recentGrades;
                if (embed) {
                    embed.color = parseInt(userSettings.color, 16);
                    dm.send({ embeds: [embed] });
                }
            } else {
                pastAssignments(message.author.id).then((res) => {
                    let embed = embedMessage?.school?.recentGrades;
                    let fieldArr: any[] = [];
                    embed.color = parseInt(userSettings.color, 16);

                    for (let x = 0; x < res.length; x++) {
                        let v = res[x].past_assignments.split("\n");

                        for (let y = 0; y < v.length; y++) {
                            v[y] = v[y].split("_");

                            if (v[y] == '') {
                                v.pop(y);
                                y--;
                            }
                        }

                        for (let g = 0; g < v.length; g++) {
                            let name: string = `${v[g][0]}`;
                            let link: string = `${v[g][1]}`;
                            let sub_score: string = `${v[g][2]}`;
                            let total_poss_pts: string = `${v[g][3]}`;
                            let mean_score: string = `${v[g][4]}`;

                            if (sub_score == 'None') sub_score = 'Not Graded ';
                            let str: string = `\n**${name}** \n__Grade: ${sub_score}/${total_poss_pts}__\n __Mean Score: ${mean_score}__\n${link}`;
                            if (res[x].past_assignments == '') res[x].pastAssignments = "No assignments from the past `" + res[0].pstgrades + "` days.";
                            if (name.length === 0) str = 'No past assignments!';
                            if (res[0].showLinks === 'NO') str = `\n**${name}** \n__Grade: ${sub_score}/${total_poss_pts}__\n __Mean Score: ${mean_score}__`;
                            
                            fieldArr.push({
                                name: `**${res[x].course_name} | ${res[x].course_code}**`,
                                value: str
                            });
                        }
                    }
                    embed.title = 'Canvas LMS | Recently Graded Assignments';
                    embed.description = `A list of grades received in the last \`${res[0].pastgrades}\` days.`;
                    embed.fields = fieldArr;

                    dm.send({ embeds: [embed] });
                });
            }
        })
    }
};
