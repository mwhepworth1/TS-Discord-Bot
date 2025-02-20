const config = require("./settings.json");
let {userSettings} = require("./user-settings.js");

async function updateSettings(c: string, g: string, l: string, r: string) {
    userSettings.color = c,
    userSettings.embedColor = parseInt(c),
    userSettings.grades = g,
    userSettings.links = l,
    userSettings.recentGrades = r
}

export interface CustomEmbed {
  color: number;
  title: string;
  description: string;
  thumbnail?: {
    url: string;
  };
  fields?: {
    name: string;
    value: string;
    inline?: boolean;
  }[];
  timestamp: string;
  footer: {
    text: string;
    iconURL: string;
  };
}

export interface EmbedMessages {
    guilds: {
        helpEmbed: CustomEmbed;
    };
    direct: {
        helpEmbed: CustomEmbed;
    };
    settings: {
        [key: string]: CustomEmbed;
    };
    school: {
        [key: string]: CustomEmbed;
    };
    assignmentNotifier: CustomEmbed;
    dnd: {
        dndToggle: CustomEmbed;
    };
}

const embedMessage: EmbedMessages = {
    guilds: {
        helpEmbed: {
            color: userSettings.embedColor,
            title: 'Canvas LMS - BYUI',
            description: 'See a list of commands and valid arguments.',
            thumbnail: {
                url: config.logoURL,
            },
            fields: [
                { 
                    name: '`help`', 
                    value: 'Displays this menu.'
                }
            ],
            timestamp: new Date().toISOString(),
            footer: {
                text: 'A CSE 310 Project | By Matthew Hepworth',
                iconURL: config.logoURL,
            },
        }
    },
    direct: {
        helpEmbed: {
            color: userSettings.embedColor,
            title: 'Canvas LMS | Help',
            description: 'See a list of commands and valid arguments.',
            thumbnail: {
                url: config.logoURL,
            },
            fields: [
                { 
                    name: '`.help`',
                    value: 'Displays this menu.'
                },
                {
                    name: '`.settings`',
                    value: 'Displays user settings.'
                },
                {
                    name: '`.settings set [parameter] [value]`',
                    value: 'Modifies the specified settings parameter with the given value'
                },
                {
                    name: '`.settings set key`',
                    value: 'Must be set to a valid 70-character long API access token'
                },
                {
                    name: '`.settings set color`',
                    value: 'Must be set to a valid hex color (ex: 00ff00).'
                },
                {
                    name: '`.settings set links`',
                    value: 'Must be set to either `show` or `hide`.'
                },
                {
                    name: '`.settings set grades`',
                    value: 'Must be set to either `show` or `hide`.'
                },
                {
                    name: '`.settings set history`',
                    value: 'Must be set to a number between (2-14)'
                },
                {
                    name: '`.grades`',
                    value: 'Displays grades for currently enrolled classes. Only works if .settings > grades is set to "show".'
                },
                {
                    name: '`.recentgrades`',
                    value: 'Displays recent grades back a certain number of days, determined by .settings > history.'
                },
                {
                    name: '`.upcoming`',
                    value: 'Displays upcoming assignments for the next 7 days for currently enrolled classes.'
                }
                // {
                //     name: '`.notifications`',
                //     value: 'Must be set to either `on` or `off`.'
                // },
                // {
                //     name: '`.dnd [optional_parameter]`',
                //     value: 'Toggles Do Not Disturb on or off -> optional_parameter = [on / off].'
                // }
            ],
            timestamp: new Date().toISOString(),
            footer: {
                text: 'A CSE 310 Project | By Matthew Hepworth',
                iconURL: config.logoURL,
            },
        },
    },
    settings: {
        mainEmbed: {
            color: userSettings.embedColor,
            title: 'Canvas LMS | Settings ',
            description: 'A list of current settings. " *(default)* " represents no user defined settings.',
            thumbnail: {
                url: config.logoURL,
            },
            fields: [
                { 
                    name: '**API Key**', 
                    value: `${userSettings.apiKey}`,
                    inline: false,
                },
                {
                    name: '**Embed Color**',
                    value: `${userSettings.color.toString(16)}`,
                    inline: true,
                },
                {
                    name: '**Show Assignment Links**',
                    value: `${userSettings.links}`,
                    inline: true,
                }, 
                {
                    name: '**Show Grades**',
                    value: `${userSettings.grades}`,
                    inline: true,
                },
                {
                    name: '**Display Recent Grades**',
                    value: `from the last ${userSettings.recentGrades}`
                }
            ],
            timestamp: new Date().toISOString(),
            footer: {
                text: 'A CSE 310 Project | By Matthew Hepworth',
                iconURL: config.logoURL,
            },
        },
        changeSetting: {
            color: userSettings.embedColor,
            title: 'Canvas LMS | Settings Error',
            description: 'No setting was defined. Available values are:\n\n`key` > Set the API Key\n`color` > Set the Message Embed Color\n`links` > Show/Hide Assignment Links\n`grades` > Show/Hide Grades',
            thumbnail: {
                url: config.logoURL,
            },
            timestamp: new Date().toISOString(),
            footer: {
                text: 'A CSE 310 Project | By Matthew Hepworth',
                iconURL: config.logoURL,
            },
        },
        changeKey: {
            color: userSettings.embedColor,
            title: 'Canvas LMS | Error Changing API Key',
            description: 'Not enough arguments. Make sure to include your API Key.',
            thumbnail: {
                url: config.logoURL,
            },
            timestamp: new Date().toISOString(),
            footer: {
                text: 'A CSE 310 Project | By Matthew Hepworth',
                iconURL: config.logoURL,
            },
        },
        changeHistory: {
            color: userSettings.embedColor,
            title: 'Canvas LMS | Error Changing Grade History',
            description: 'Not enough arguments. Make sure to include a number in days.',
            thumbnail: {
                url: config.logoURL,
            },
            timestamp: new Date().toISOString(),
            footer: {
                text: 'A CSE 310 Project | By Matthew Hepworth',
                iconURL: config.logoURL,
            },
        },
        invalidHistoryArg: {
            color: userSettings.embedColor,
            title: 'Canvas LMS | Error Changing Grade History',
            description: 'Invalid arguments. Make sure to include a number in days.',
            thumbnail: {
                url: config.logoURL,
            },
            timestamp: new Date().toISOString(),
            footer: {
                text: 'A CSE 310 Project | By Matthew Hepworth',
                iconURL: config.logoURL,
            },
        },
        setHistory: {
            color: userSettings.embedColor,
            title: 'Canvas LMS | Grade History Changed',
            description: 'The number of days your grade history will go back is `?` days.',
            thumbnail: {
                url: config.logoURL,
            },
            timestamp: new Date().toISOString(),
            footer: {
                text: 'A CSE 310 Project | By Matthew Hepworth',
                iconURL: config.logoURL,
            },
        },
        setKey: {
            color: userSettings.embedColor,
            title: 'Canvas LMS | Changed API Key',
            description: 'Successfully changed API Key! Please allow a few minutes for this change to take effect.',
            thumbnail: {
                url: config.logoURL,
            },
            timestamp: new Date().toISOString(),
            footer: {
                text: 'A CSE 310 Project | By Matthew Hepworth',
                iconURL: config.logoURL,
            },
        },
        changeColor: {
            color: userSettings.embedColor,
            title: 'Canvas LMS | Error Changing Embed Color',
            description: 'Not enough arguments. Make sure to include your color as a HEX code.',
            thumbnail: {
                url: config.logoURL,
            },
            timestamp: new Date().toISOString(),
            footer: {
                text: 'A CSE 310 Project | By Matthew Hepworth',
                iconURL: config.logoURL,
            },
        },
        setColor: {
            color: userSettings.embedColor,
            title: 'Canvas LMS | Changed Embed Color',
            description: 'Successfully changed Embed Color! Please allow a minute for this change to take effect.',
            thumbnail: {
                url: config.logoURL,
            },
            timestamp: new Date().toISOString(),
            footer: {
                text: 'A CSE 310 Project | By Matthew Hepworth',
                iconURL: config.logoURL,
            },
        },
        changeLinks: {
            color: userSettings.embedColor,
            title: 'Canvas LMS | Error Changing Link Display Settings',
            description: 'Not enough arguments. Make sure to include `show` or `hide`.',
            thumbnail: {
                url: config.logoURL,
            },
            timestamp: new Date().toISOString(),
            footer: {
                text: 'A CSE 310 Project | By Matthew Hepworth',
                iconURL: config.logoURL,
            },
        },
        setShowLinks: {
            color: userSettings.embedColor,
            title: 'Canvas LMS | Showing Assignment Links',
            description: 'Successfully changed the display of assignment links to `show`! Please allow a few minutes for this change to take effect.',
            thumbnail: {
                url: config.logoURL,
            },
            timestamp: new Date().toISOString(),
            footer: {
                text: 'A CSE 310 Project | By Matthew Hepworth',
                iconURL: config.logoURL,
            },
        },
        setHideLinks: {
            color: userSettings.embedColor,
            title: 'Canvas LMS | Hiding Assignment Links',
            description: 'Successfully changed the display of assignment links to `hide`! Please allow a few minutes for this change to take effect.',
            thumbnail: {
                url: config.logoURL,
            },
            timestamp: new Date().toISOString(),
            footer: {
                text: 'A CSE 310 Project | By Matthew Hepworth',
                iconURL: config.logoURL,
            },
        },
        invalidLinkSetting: {
            color: userSettings.embedColor,
            title: 'Canvas LMS | Error Changing Display of Assignment Links',
            description: 'Please indicate if you\'d like to `hide` or `show` links to your assignments in messages.',
            thumbnail: {
                url: config.logoURL,
            },
            timestamp: new Date().toISOString(),
            footer: {
                text: 'A CSE 310 Project | By Matthew Hepworth',
                iconURL: config.logoURL,
            },
        },
        changeGrades: {
            color: userSettings.embedColor,
            title: 'Canvas LMS | Error Changing Grade Display Settings',
            description: 'Not enough arguments. Make sure to include `show` or `hide`.',
            thumbnail: {
                url: config.logoURL,
            },
            timestamp: new Date().toISOString(),
            footer: {
                text: 'A CSE 310 Project | By Matthew Hepworth',
                iconURL: config.logoURL,
            },
        },
        setShowGrades: {
            color: userSettings.embedColor,
            title: 'Canvas LMS | Showing Assignment Grades',
            description: 'Successfully changed the display of assignment grades to `show`! Please allow a few minutes for this change to take effect.',
            thumbnail: {
                url: config.logoURL,
            },
            timestamp: new Date().toISOString(),
            footer: {
                text: 'A CSE 310 Project | By Matthew Hepworth',
                iconURL: config.logoURL,
            },
        },
        setHideGrades: {
            color: userSettings.embedColor,
            title: 'Canvas LMS | Hiding Assignment Grades',
            description: 'Successfully changed the display of assignment grades to `hide`! Please allow a few minutes for this change to take effect.',
            thumbnail: {
                url: config.logoURL,
            },
            timestamp: new Date().toISOString(),
            footer: {
                text: 'A CSE 310 Project | By Matthew Hepworth',
                iconURL: config.logoURL,
            },
        },
        invalidGradeSetting: {
            color: userSettings.embedColor,
            title: 'Canvas LMS | Error Changing Display of Assignment Grades',
            description: 'Please indicate if you\'d like to `hide` or `show` grades for your assignments in messages.',
            thumbnail: {
                url: config.logoURL,
            },
            timestamp: new Date().toISOString(),
            footer: {
                text: 'A CSE 310 Project | By Matthew Hepworth',
                iconURL: config.logoURL,
            },
        },
    },
    school: {
        recentGrades: {
            color: userSettings.embedColor,
            title: 'Canvas LMS | Error',
            description: 'Unable to display your recent grades. Check your grade visibility settings.',
            thumbnail: {
                url: config.logoURL,
            },
            timestamp: new Date().toISOString(),
            footer: {
                text: 'A CSE 310 Project | By Matthew Hepworth',
                iconURL: config.logoURL,
            },
        },
        upcoming: {
            color: userSettings.embedColor,
            title: 'Canvas LMS | Upcoming Assignments ',
            description: 'A list of assignments due in the next seven (7) days.',
            thumbnail: {
                url: config.logoURL,
            },
            fields: [
                { 
                    name: '**Assignment Name | COURSE CODE**', 
                    value: `DUE: <DATE>\nLINK: <URL>`,
                    inline: true,
                },
                { 
                    name: '**Assignment Name | COURSE CODE**', 
                    value: `DUE: <DATE>\nLINK: <URL>`,
                    inline: true,
                },
                { 
                    name: '**Assignment Name | COURSE CODE**', 
                    value: `DUE: <DATE>\nLINK: <URL>`,
                    inline: true,
                },
                { 
                    name: '**Assignment Name | COURSE CODE**', 
                    value: `DUE: <DATE>\nLINK: <URL>`,
                    inline: true,
                },
                { 
                    name: '**Assignment Name | COURSE CODE**', 
                    value: `DUE: <DATE>\nLINK: <URL>`,
                    inline: true,
                },
                { 
                    name: '**Assignment Name | COURSE CODE**', 
                    value: `DUE: <DATE>\nLINK: <URL>`,
                    inline: true,
                },
                { 
                    name: '**Assignment Name | COURSE CODE**', 
                    value: `DUE: <DATE>\nLINK: <URL>`,
                    inline: true,
                },
                { 
                    name: '**Assignment Name | COURSE CODE**', 
                    value: `DUE: <DATE>\nLINK: <URL>`,
                    inline: true,
                },
                { 
                    name: '**Assignment Name | COURSE CODE**', 
                    value: `DUE: <DATE>\nLINK: <URL>`,
                    inline: true,
                },
                { 
                    name: '**Assignment Name | COURSE CODE**', 
                    value: `DUE: <DATE>\nLINK: <URL>`,
                    inline: true,
                }
            ],
            timestamp: new Date().toISOString(),
            footer: {
                text: 'A CSE 310 Project | By Matthew Hepworth',
                iconURL: config.logoURL,
            },
        },
        grades: {
            color: userSettings.embedColor,
            title: 'Canvas LMS | Current Course Grades ',
            description: 'A list of grades and their associated courses..',
            thumbnail: {
                url: config.logoURL,
            },
            fields: [
                { 
                    name: '**Course Name: <GRADE>**', 
                    value: `<percentage score>`,
                    inline: true,
                },
                { 
                    name: '**Course Name: <GRADE>**', 
                    value: `<percentage score>`,
                    inline: true,
                },
                { 
                    name: '**Course Name: <GRADE>**', 
                    value: `<percentage score>`,
                    inline: true,
                },
                { 
                    name: '**Course Name: <GRADE>**', 
                    value: `<percentage score>`,
                    inline: true,
                },
                { 
                    name: '**Course Name: <GRADE>**', 
                    value: `<percentage score>`,
                    inline: true,
                },
                { 
                    name: '**Course Name: <GRADE>**', 
                    value: `<percentage score>`,
                    inline: true,
                },
                { 
                    name: '**Course Name: <GRADE>**', 
                    value: `<percentage score>`,
                    inline: true,
                },
                { 
                    name: '**Course Name: <GRADE>**', 
                    value: `<percentage score>`,
                    inline: true,
                },
                { 
                    name: '**Course Name: <GRADE>**', 
                    value: `<percentage score>`,
                    inline: true,
                },
                { 
                    name: '**Course Name: <GRADE>**', 
                    value: `<percentage score>`,
                    inline: true,
                },
                
            ],
            timestamp: new Date().toISOString(),
            footer: {
                text: 'A CSE 310 Project | By Matthew Hepworth',
                iconURL: config.logoURL,
            },
        },
        noGradesPerm: {
            color: userSettings.embedColor,
            title: 'Canvas LMS | Whoops!',
            description: 'Unable to display your grades. Check your settings.',
            thumbnail: {
                url: config.logoURL,
            },
            timestamp: new Date().toISOString(),
            footer: {
                text: 'A CSE 310 Project | By Matthew Hepworth',
                iconURL: config.logoURL,
            },
        },
    },
    assignmentNotifier: {
            color: userSettings.embedColor,
            title: 'Canvas LMS | Upcoming Assignments (Automatically Generated)',
            description: 'A list of assignments due in the next seven (7) days.',
            thumbnail: {
                url: config.logoURL,
            },
            fields: [
                { 
                    name: '**Assignment Name | COURSE CODE**', 
                    value: `DUE: <DATE>\nLINK: <URL>`,
                    inline: true,
                },
                { 
                    name: '**Assignment Name | COURSE CODE**', 
                    value: `DUE: <DATE>\nLINK: <URL>`,
                    inline: true,
                },
                { 
                    name: '**Assignment Name | COURSE CODE**', 
                    value: `DUE: <DATE>\nLINK: <URL>`,
                    inline: true,
                },
                { 
                    name: '**Assignment Name | COURSE CODE**', 
                    value: `DUE: <DATE>\nLINK: <URL>`,
                    inline: true,
                },
                { 
                    name: '**Assignment Name | COURSE CODE**', 
                    value: `DUE: <DATE>\nLINK: <URL>`,
                    inline: true,
                },
                { 
                    name: '**Assignment Name | COURSE CODE**', 
                    value: `DUE: <DATE>\nLINK: <URL>`,
                    inline: true,
                },
                { 
                    name: '**Assignment Name | COURSE CODE**', 
                    value: `DUE: <DATE>\nLINK: <URL>`,
                    inline: true,
                },
                { 
                    name: '**Assignment Name | COURSE CODE**', 
                    value: `DUE: <DATE>\nLINK: <URL>`,
                    inline: true,
                },
                { 
                    name: '**Assignment Name | COURSE CODE**', 
                    value: `DUE: <DATE>\nLINK: <URL>`,
                    inline: true,
                },
                { 
                    name: '**Assignment Name | COURSE CODE**', 
                    value: `DUE: <DATE>\nLINK: <URL>`,
                    inline: true,
                }
            ],
            timestamp: new Date().toISOString(),
            footer: {
                text: 'A CSE 310 Project | By Matthew Hepworth',
                iconURL: config.logoURL,
            },
    },
    dnd: {
        dndToggle: {
            color: userSettings.embedColor,
            title: 'Canvas LMS | Do Not Disturb',
            description: '',
            thumbnail: {
                url: config.logoURL,
            },
            timestamp: new Date().toISOString(),
            footer: {
                text: 'A CSE 310 Project | By Matthew Hepworth',
                iconURL: config.logoURL,
            },
        }
    }
}
export { embedMessage, updateSettings };