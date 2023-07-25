# File structure conventions

This document is intended to be a guide for the file structure of the dynamic modules of the bot like commands and events. Describes the conventions used to define the structure of the modules and what information is extracted from the structure.


## General

### !name

Any file or directory that starts with ! will be ignored from ts compiler and from dynamic imports

### +name

The + at the start of any file or directory name is reserved for special purposes inside commands, events and generated folders

### +skipname

The +skip at the start of any file or directory name is reserved to indicate that must be ignored from dinamyc imports

> Note: recommended to use a `.` after the +skip, like +skip.name to aument the readability of the file structure or in case of a folder just leave it as +skip


## Events

| Entry type | Pattern | Description |
| :-: | :-: | :-: |
| file | +type\\.(ts\|js) | name reserved for shorting import path of common event types |
| dir - file | \[^!]\w+ | name reserved for event script |


### Usage example

```text
🌳 events/
┣ 📄 +type.ts
┣ 📄 botClientReady.ts
┣ 📄 memberAgreedRules.ts
┣ 📄 !memberLeft.ts
┗ 📄 slashCommand.ts
```


## Commands

| Entry type | Pattern | Description |
| :-: | :-: | :-: |
| dir - file | \[\\w+] | reserved for future dynamic purposes |
| dir | (\\w+) | reserved for grouping a series of commands |
| file | +type\\.(ts\|js) | name reserved for shorting import path of common command related imports |
| file | +group\\.(ts\|js) | reserved for setuping a group |
| file | \\w+\\.(ts\|js) | reserved for singlefile command |
| dir | \\w+ | reserved for multifile command definition |
| file | +command\\.(ts\|js) | reserved for setuping a multifile command |
| dir | \\w+ -> (\\w+) | reserved for grouping a series of subcommands |
| file | +subgroup\\.(ts\|js) | reserved for setuping a group of subcommands |


### +name

#### File

+setup.ts is to setup configurations for folder containing the file

+base.ts is to setup the base definition of a command

+skip.ts / +skip.name.ts is to skip a file from being interpreted as a command

#### Folder

+categories is to define command categories and be used in command definitions

+skip / +skip.name is to skip a folder from being interpreted as a command folder


### (name)

Especial naming to create logic groups, a logic group can be used to define a configuration or defaults for the contents of the folder. Its configured with a +setup.ts


### \[name]

Especial naming for dynamic content/commands. Reserved but not actually used. Files/foldes with this naming convention will be ignored at this moment


### name

#### File

A simple file will be treated as a simple command if in its folder there isn't a +command.ts in that case will be treated as a subcommand

#### Folder

A simple folder will be treated as a folder command definition, it must include a +command.ts and at least 1 subcommand


### Usage example

```text
🌳 commands/
┣ 📁 !(ai)/
┃ ┣ 📁 +skip/
┃ ┃ ┣ 📄 types.ts
┃ ┃ ┗ 📄 users.ts
┃ ┣ 📄 chat-admin.ts
┃ ┗ 📄 chat.ts
┣ 📁 (admin)/
┃ ┣ 📁 createMenu/
┃ ┃ ┣ 📄 +command.ts
┃ ┃ ┗ 📄 select-rol.ts
┃ ┣ 📁 list/
┃ ┃ ┣ 📄 +command.ts
┃ ┃ ┗ 📄 select-menu.ts
┃ ┣ 📁 remove/
┃ ┃ ┣ 📄 +command.ts
┃ ┃ ┗ 📄 select-menu.ts
┃ ┣ 📄 +group.ts
┃ ┣ 📄 say.ts
┃ ┗ 📄 server-message.ts
┣ 📁 (dev)/
┃ ┣ 📄 +group.ts
┃ ┣ 📄 get-commands.ts
┃ ┗ 📄 ping.ts
┣ 📄 +type.ts
┗ 📄 server-invite.ts
```
