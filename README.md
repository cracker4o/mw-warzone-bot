# mw-warzone-bot

A Discord bot for Modern Warfare

Welcome to the mw-warzone-bot repository! The mw-warzone bot currently uses the [Node-CallOfDuty-es6] which provides the functionality to get multiplayer and Warzone stats for a platform and a user. The discord bot makes it easier to check how your friends and teammates are doing in the game and gets information about their played games, K/D ratio, damage, skill level and rank.

# Project setup

To setup the *mw-warzone-bot* project please follow the steps below:
- make sure you have the latest stable version of node.js installed. You can download it from https://nodejs.org
- clone the *mw-warzone-bot* repository
- go to the [Discord developer portal] and setup a new bot account. [Here is a good tutorial how to do it]
- after the bot is created, copy your bot's secret token and paste it in the auth.json file of the *mw-warzone-bot* project.
- run the following command `npm install`
- when all npm packages are installed you can type `node bot.js` and it would start the bot.

You can add your bot to any Discord server you administrate with this link 
```
https://discordapp.com/oauth2/authorize?client_id={OAUTH_CLIENTID}&scope=bot&permissions={PERMISSIONS_INTEGER} 
```
The OAUTH_CLIENTID placeholder stands for your custom Client ID that is generated for your application by the Discord developer portal.
The PERMISSIONS_INTEGER specifies bot's permissions, and it can be generated from the Discord developer portal.

# Bot commands

In discord, you can type the following to check what commands the bot supports.
```
!mw help
```

To check Modern Warfare Warzone user statistics please use the following command:
```
!mw {platform} {username}
```
The {platform} placeholder supports the following values:
psn
xbl
battle (Battle.net)
uno (activision ID)

To check the user stats for a specific game mode you can use the following command:
```
!mw {mode} {platform} {username}
```

The mode can be one of the following:
gun: 'Gun Fight',
dom: 'Domination',
war: 'Team Deathmatch',
hq: 'Headquarters',
hc_dom: 'Domination Hardcore',
hc_conf: 'Kill Confirmed Hardcore',
koth: 'Hardpoint',
conf: 'Kill Confirmed',
hc_hq: 'Headquarters Hardcore',
arena: '2v2',
br_dmz: 'Plunder',
br: 'Warzone',
sd: 'Search and Destroy',
grnd: 'Grind',
cyber: 'Cyber Attack',
hc_war: 'Team Deathmatch Hardcore',
br_all: 'Warzone',
hc_sd: 'Search and Destroy Hardcore',
arm: 'Ground War',
hc_cyber: 'Cyber Attack Hardcore',
infect: 'Infected'

# Associate Users

Users in Discord can associate themselves with their platform user by using the following command:
```
!mw set {platform} {username}
```
This will allow the use of all of the bot's commands without having to input your user and platform each time.
e.g.:
```
!mw br
```

[Node-CallOfDuty-es6]: https://github.com/Lierrmm/Node-CallOfDuty-es6
[Discord developer portal]: https://discordapp.com/developers/applications/
[Here is a good tutorial how to do it]: https://discordpy.readthedocs.io/en/rewrite/discord.html