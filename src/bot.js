const Discord = require('discord.js');
const logger = require('winston');
const auth = require('./auth.json');
const fetch = require('node-fetch');
const API = require('call-of-duty-api')();

// Configure the console logger settings
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';

// Initialize the Discord Bot
const bot = new Discord.Client();
let loggedIn = false;

/**
 * Shows the available commands
 */
function showHelp(message) {
    const helpRegex = /^!mw (help|commands)(.*)?$/;
    const helpMatches = message.content.match(helpRegex);
    if (helpMatches) {
        const embed = new Discord.MessageEmbed();
        embed.setTitle('Modern Warfare bot commands:')
            .setColor(0x00AE86)
            .setDescription('You can get info about your user and some additional global stats by using the following commands')
            .addField('!mw {platform} {username}', 
            `
            where the {platform} placeholder can be:
            psn
            xbl
            battle
            uno (activision ID)
            and the {username} placeholder is your MW user name.
            Example:
            !mw battle cracky#123456
            `)
            .setFooter(
            `The MW Api uses data from the callofduty.com API`)
        message.channel.send({embed});
    }
}

/**
 * Gets user's stats
 */
function getUserStats(message) {
    const regex = /^\!mw (battle|psn|xbl|uno) (.*)$/;
    const matches = message.content.match(regex);
    if (!matches) {
        return;
    }

    const platform = matches[1];
    const username = matches[2];

    if (!API.platforms[platform]) {
        logger.warn('Invalid platform');
        return;
    }

    API.MWstats(username, API.platforms[platform])
        .then((output) => {
            logger.info(JSON.stringify(output));
            const embed = new Discord.MessageEmbed();
            const lifetime = output.lifetime.all.properties;
            embed.setTitle(`Modern Warfare stats for user: ${username}`)
                .setColor(0x00AE86)
                .setDescription('User Stats:')
                .addField("Warzone", JSON.stringify(output.lifetime.mode.br_all))
                .addFields(
                    { name: "Level", value: output.level, inline: true },
                    {
                      name: "Time played",
                      value: `${(lifetime.timePlayedTotal / 3600).toFixed(2)}h`,
                      inline: true,
                    },
                    {
                      name: "Best KD",
                      value: lifetime.bestKD,
                      inline: true,
                    },
                    { name: "K/D", value: lifetime.kdRatio.toFixed(2), inline: true },
                    { name: "W/L", value: lifetime.wlRatio.toFixed(2), inline: true },
                    {
                      name: "Acc",
                      value: `${lifetime.accuracy.toFixed(2)}%`,
                      inline: true,
                    },
                    { name: "Kills", value: lifetime.kills, inline: true },
                    {
                      name: "Headshots",
                      value: `${lifetime.headshots} (${(
                        (lifetime.headshots / lifetime.kills) *
                        100
                      ).toFixed(2)}%)`,
                      inline: true,
                    },
                    { name: "Best killstreak", value: lifetime.bestKillStreak, inline: true },
                    {
                      name: "Most kills in a game",
                      value: lifetime.bestKills,
                      inline: true,
                    },
                    { name: "Most deaths in a game", value: lifetime.recordDeathsInAMatch }
                );
            message.channel.send({embed});
        }).catch((err) => {
            logger.error(err);
        });

}

/**
 * This event is triggered when the mw-warzone-bot is connected to the Discord server.
 */
bot.on('ready', function () {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(`${bot.user.username}-(${bot.user.id})`);

    // The CoD API requires a login from a dummy account.
    // This prevents the CoD servers from throttling requests.
    API.login(auth.mwUser, auth.mwPassword).then(() => {
        loggedIn = true;
    }).catch((error) => {
        loggedIn = false;
        logger.error(error);
    });
});

/**
 * This event is triggered when the mw-warzone-bot receives a message.
 */
bot.on('message', function (message) {
    showHelp(message);
    getUserStats(message);
});

bot.on('debug', logger.debug);

// Login the mw-warzone-bot to all registered Discord servers.
bot.login(auth.token);