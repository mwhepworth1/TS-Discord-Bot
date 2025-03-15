## Overview

**Project Title**: TypeScript Discord Bot

**Project Description**: A discord bot that links to Canvas to provide data within Discord from BYU-Idaho's LMS built in TS.

**Project Goals**: Design, build, and refine a Discord Bot that communicates with the Canvas LMS REST API to share grade information for students in Discord.

## Instructions for Build and Use

Steps to build and/or run the software:

1. Install all dependencies ```npm i --save```
2. Compile and run: npx tsc && node dist/index
3.

Instructions for using the software:

1. Set important keys in settings.json
2. DM the bot in discord
3.

## Development Environment 

To recreate the development environment, you need the following software and/or libraries with the specified versions:

* "@types/mysql": "^2.15.26",
* "@types/node": "^22.13.4",
* "@types/ws": "^8.5.14",
* "axios": "^1.7.9",
* "discord.js": "^14.18.0",
* "dotenv": "^16.4.7",
* "mysql": "2.18.1",
* "ts-node": "^10.9.2",
* "typescript": "^5.7.3",
* "node-cron": "^3.0.3",
* "@types/node-cron": "^3.0.11"

## Useful Websites to Learn More

I found these websites useful in developing this software:

* [DiscordJS](https://discord.js.org)
* [GitHub Copilot](https://github.com/copilot)
* 

## Future Work

The following items I plan to fix, improve, and/or add to this project in the future:

* [x] Add scheduled tasks including routinely updating student data on demand and at intervals
* [ ] Add Database encryption for sensitive Canvas API keys
* [ ] Share & include disclaimers for FERPA laws.