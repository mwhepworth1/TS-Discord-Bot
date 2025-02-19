/**
 * Notes: An interface is similar to a class in C#, but the idea is that you are defining
 * what object properties type is going to be, and TS will enforce that type on the object.
 * Think "string varName = string.Empty;" in C#. This is a way to define the type of the object.
 */
export interface Settings {
    color: string;
    links: string;
    grades: string;
    recentGrades: string;
    embedColor: string;
    apiKey: string;
    defaults: {
        color: string;
        links: string;
        grades: string;
        recentGrades: string;
    };
}

interface IsDefault {
    color: string;
    links: string;
    grades: string;
    recentGrades: string;
}

/**
 * Notes: When defining a variable, you can use var, let, const, etc.
 * After naming the variable, the ":" is used to indicate what the type of this variable should be.
 * TS will enforce this type on the variable. 
 * 
 * i.e. A string cannot be assigned to a number type variable. (var x: number = 5; x = "hello";)
 */
let color: string = "`0xE80231`";
let links: string = "`YES`";
let grades: string = "`YES`";
let recentGrades: string = "14";
let defaultStr: string = " *(default)*";
let apiKey: string = '*This content is not displayed for security purposes.*';

let defaults: Settings["defaults"] = {
    color: "`0xE80231`",
    links: "`YES`",
    grades: "`YES`",
    recentGrades: "14",
};

let isDefault: IsDefault = {
    color: "",
    links: "",
    grades: "",
    recentGrades: "",
};

async function fetchSettings(c: string, l: string, g: string, r: string): Promise<Settings> {
    color = `\`${c}\``;
    grades = `\`${g}\``;
    links = `\`${l}\``;
    recentGrades = r;
    await finalizeSettings();
    return {
        color: color,
        grades: grades,
        links: links,
        recentGrades: recentGrades,
        embedColor: c,
        apiKey: apiKey,
        defaults: defaults
    };
}

async function updateDefaults(): Promise<void> {
    if (defaults.color === color) isDefault.color = defaultStr;
    if (defaults.links === links) isDefault.links = defaultStr;
    if (defaults.grades === grades) isDefault.grades = defaultStr;
    if (defaults.recentGrades === recentGrades) isDefault.recentGrades = " " + defaultStr;
}

async function finalizeSettings(): Promise<void> {
    await updateDefaults();
}

let userSettings: Settings = {
    embedColor: color.split("`")[1],
    color: color + isDefault.color,
    links: links + isDefault.links,
    grades: grades + isDefault.grades,
    recentGrades: "`" + recentGrades + "`" + " days" + isDefault.recentGrades,
    apiKey: apiKey,
    defaults: defaults,
};

export { userSettings, defaults, fetchSettings, finalizeSettings };