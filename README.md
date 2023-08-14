# Student-Bot

A bot for managing a Discord server for students of computer science at Facultad Informatica UNLP, Argentina.

> Still in development.


## Features

- Bot related
  - Commands
    - [X] Command handler
    - [X] Static commands
    - [X] Dynamic commands
    - [ ] Command categories
    - [ ] Command internazionalization
    - [ ] Command cooldown
    - [ ] Command permissions
    - [ ] Help command
  - Events
    - [X] Event handler
    - [ ] Dynamic events
    - [ ] Subscription to events
  - Tasks
    - [X] Task manager
    - [X] Dynamic tasks
    - [X] One time tasks
    - [X] Repeating tasks
  - Presence
    - [X] Presence manager
    - [X] Static config presence
    - [ ] Dynamic config presence
  - Plugins
    - [ ] Plugin loader
    - [ ] Plugin lifecycle hooks
    - [ ] Plugin configuration
    - [ ] Enable/disable plugins
    - [ ] Plugin intercommunication
  - Configuration
    - [ ] Configuration defaults
    - [ ] Configuration persistance (file/db)
    - [ ] Configuration loader
    - [ ] Configuration validation

- Server related
  - [X] Customizable welcome message
  - [X] Customizable boost message
  - [X] On join role assignment (when agreed to rules)
  - [X] Server message

- Extra features
  - [X] University news reposting

> Note: This list is not complete and will be updated as the development progresses. Unmarked features could never be implemented.


## Installation

```bash
git clone https://github.com/J-Josu/do-discord-bot

cd do-discord-bot

npm install
```

Create a `.env` file in the root directory with the following content:

```bash
RUNNING_ENVIROMENT=development
BOT_TOKEN=your_bot_token
APPLICATION_ID=your_application_id
GUILD_ID=your_guild_id
```

> Change the values of the variables to the corresponding ones depending if the enviroment is development or production.

Configure the necessary items in [src/botConfig.ts](./src/botConfig.ts)

When developing run:

```bash
npm run dev

# if hot reload is not needed, run:

npm run start:dev
```

When deploying run:

```bash
npm run build
npm run start:prod
```

## Available commands

**Icon meanings:**
```text
📦 Category / group of commands
📁 A command that has subcommands
📄 A command / subcommand if its inside of 📁
```

**List of commands:**
```text
📦 admin
┣ 📁 createMenu
┃ ┗ 📄 select-rol
┣ 📁 list
┃ ┗ 📄 select-menu
┣ 📁 remove
┃ ┗ 📄 select-menu
┣ 📄 check-billboard
┣ 📄 clear-chat
┣ 📄 purge-channel
┣ 📄 say
┗ 📄 server-message
📦 dev
┣ 📄 get-commands
┗ 📄 ping
📦 unlp
┣ 📁 bibliofi
┃ ┣ 📄 advanced-search
┃ ┣ 📄 search
┃ ┗ 📄 sites
┣ 📁 info
┃ ┣ 📄 finals
┃ ┣ 📄 sites
┃ ┗ 📄 socials
┣ 📁 student-group
┃ ┣ 📄 center
┃ ┣ 📄 explain
┃ ┗ 📄 socials
┃ 📄 r-info
┗ 📄 verify
📦 utils
┣ 📁 pomodoro
┃ ┣ 📄 end
┃ ┣ 📄 explain
┃ ┣ 📄 help
┃ ┣ 📄 left
┃ ┣ 📄 pause
┃ ┣ 📄 resume
┃ ┗ 📄 start
┣ 📁 random
┃ ┣ 📄 coin
┃ ┣ 📄 group
┃ ┣ 📄 selection
┃ ┗ 📄 yes-no
┣ 📄 afk
┣ 📄 playlists
┣ 📄 reminder
┗ 📄 rock-paper-scissors
📄 server-invite
```

## More info

More info related to the bot/project can be found in the [docs folder](./docs/)

More info about some of the used packages:
- [discord.js](https://discord.js.org/#/)
- [node-html-markdown](https://github.com/crosstype/node-html-markdown)
- [zod](https://zod.dev/)
