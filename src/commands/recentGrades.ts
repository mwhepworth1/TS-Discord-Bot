import { DMChannel, Message } from 'discord.js';
import { Command } from '../types/interfaces';
import { Settings } from '../data/user-settings';
import { EmbedMessages, embedMessage } from '../data/messages';
import { showGradeHistory, addKey, setColor, linkVisibility, gradeVisibility, setHistory, pastAssignments } from '../data/db/mysql';

function getEmbedSize(embed: any): number {
    let total = 0;
    if (embed.title) total += embed.title.length;
    if (embed.description) total += embed.description.length;
    if (embed.footer && embed.footer.text) total += embed.footer.text.length;
    if (embed.fields) {
        for (const field of embed.fields) {
            if (field.name) total += field.name.length;
            if (field.value) total += field.value.length;
        }
    }
    return total;
}

function truncateText(text: string, maxLen: number): string {
    return text.length > maxLen ? text.substring(0, maxLen - 3) + "..." : text;
}

function constrainEmbedFields(embed: any): void {
    if (embed.fields && Array.isArray(embed.fields)) {
        interface EmbedField {
            name?: string;
            value?: string;
        }

                embed.fields = embed.fields.map((field: EmbedField): EmbedField => {
                    if (field.name && field.name.length > 256) {
                        field.name = field.name.substring(0, 253) + '...';
                    }
                    if (field.value && field.value.length > 1024) {
                        field.value = field.value.substring(0, 1021) + '...';
                    }
                    return field;
                });
    }
}

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
                pastAssignments(message.author.id).then((r) => {
                    let embed = embedMessage?.school?.recentGrades;
                    let fieldArr: any[] = [];
                    embed.color = parseInt(userSettings.color, 16);

                    for (let x = 0; x < r.length; x++) {
                        let v = r[x].past_assignments.split("\n");

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
                            if (r[x].past_assignments == '') r[x].pastAssignments = "No assignments from the past `" + r[0].pastgrades + "` days.";
                            if (name.length === 0) str = 'No past assignments!';
                            if (r[0].showLinks === 'NO') str = `\n**${name}** \n__Grade: ${sub_score}/${total_poss_pts}__\n __Mean Score: ${mean_score}__`;
                            
                            fieldArr.push({
                                name: `**${r[x].course_name} | ${r[x].course_code}**`,
                                value: str
                            });
                        }
                    }

                    embed.title = 'Canvas LMS | Recently Graded Assignments';
                    embed.description = `A list of grades received in the last \`${null}\` days.`;
                    embed.fields = fieldArr;

                    constrainEmbedFields(embed);

                    const MAX_EMBED_SIZE = 6000;

                    // Remove extra fields if overall embed size is still too high
                    while (getEmbedSize(embed) > MAX_EMBED_SIZE && embed.fields.length) {
                        embed.fields.pop();
                    }

                    if (embed.fields.length > 10) {
                        embed.fields = embed.fields.slice(0, 10);
                    }

                    // Optionally, truncate the embed description if needed
                    if (getEmbedSize(embed) > MAX_EMBED_SIZE && embed.description) {
                        const excess = getEmbedSize(embed) - MAX_EMBED_SIZE;
                        embed.description = truncateText(embed.description, embed.description.length - excess);
                    }

                    dm.send({ embeds: [embed] });
                    
                });
            }
        })
    }
};
