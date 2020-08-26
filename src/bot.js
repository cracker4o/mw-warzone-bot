import logger from 'winston';
import {Client, MessageEmbed} from 'discord.js';
import {MWStats} from './components/mw-stats';
import { api, platforms } from 'call-of-duty-api-es6';

const auth = require('./auth.json');
const API = new api();
// Configure the console logger settings
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';

// Initialize the Discord Bot
const bot = new Client();
let loggedIn = false;

/**
 * Shows the available commands
 */
const showHelp = (message) => {
    const helpRegex = /^!mw (help|commands)(.*)?$/;
    const helpMatches = message.content.match(helpRegex);
    if (helpMatches) {
        const embed = new MessageEmbed();
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
        message.channel.send({ embed });
    }
}

/**
 * Gets user's stats
 */
const getUserStats = async (message) => {
    const regex = /^\!mw (battle|psn|xbl|uno) (.* )?(.*)$/;
    const matches = message.content.match(regex);
    if (!matches) {
        return;
    }

    const platform = matches[1];
    const mode = matches[2] != null ? matches[2].trim() : 'br_all';
    const username = matches[3];
    
    if (!platforms[platform]) {
        logger.warn('Invalid platform');
        return;
    }

    try {
        const data = await API.MWstats(username, platforms[platform]);
        logger.info(JSON.stringify(data));

        switch (mode) {
            case 'lifetime':
                const mwStats = new MWStats();
                const messageEmbed = mwStats.getLifetimeStats(data);
                message.channel.send(messageEmbed);
                return;
            default:
                const embed = new MessageEmbed();
                embed.setTitle(`Modern Warfare stats for user: ${username}`)
                    .setColor(0x00AE86)
                    .setDescription('User Stats:')
                    .addField("Warzone", JSON.stringify(data.lifetime.mode[mode].properties));
                message.channel.send({ embed });
                break;
        }
    } 
    catch(err) {
        logger.error(err);
    }
}

/**
 * This event is triggered when the mw-warzone-bot is connected to the Discord server.
 */
bot.on('ready', async () => {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(`${bot.user.username}-(${bot.user.id})`);

    // The CoD API requires a login from a dummy account.
    // This prevents the CoD servers from throttling requests.
    try {
        await API.login(auth.mwUser, auth.mwPassword);
    }
    catch(error) {
        loggedIn = false;
        logger.error(error);
    } 
    finally {
        loggedIn = true;
    }
});

/**
 * This event is triggered when the mw-warzone-bot receives a message.
 */
bot.on('message', async (message) => {
    showHelp(message);
    await getUserStats(message);
});

bot.on('debug', logger.debug);

// Login the mw-warzone-bot to all registered Discord servers.
bot.login(auth.token);
