import logger from 'winston';
import { Client, MessageEmbed } from 'discord.js';
import { MWStats } from './components/mw-stats';
import { UserDB } from './components/user-db';
import { api, platforms } from 'call-of-duty-api-es6';

const auth = require('./auth.json');
const config = require('./config.json');
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
const showHelp = message => {
    const embed = new MessageEmbed();
    embed.setTitle('Modern Warfare Bot')
        .setColor(0x00AE86)
        .setDescription('MW Bot lets you get info about your user and some additional global stats. Click the link to go to the GitHub README for how to use the bot.')
        .setURL('https://github.com/cracker4o/mw-warzone-bot')
        .setFooter('The MW Api uses data from the callofduty.com API');
    message.channel.send({ embed });
}

/**
 * Gets user's stats
 */
const getUserStats = async message => {
    const data = await determineUserAndPlatform(message);

    if (!data) {
        message.channel.send(new MessageEmbed()
            .setColor(0x00AE86)
            .setDescription(`No association found for ${message.author.username}#${message.author.discriminator}. Use '!mw set <platform> <username>' to associate yourself.`));
        return;
    }

    const platform = data.platform;
    const mode = data.mode;
    const username = data.username;

    if (!platforms[platform]) {
        logger.warn('Invalid platform');
        return;
    }

    logger.debug(`getting ${platform} ${mode} stats for ${username}`);

    try {
        const data = await API.MWstats(username, platforms[platform]);

        if (!mode || mode === 'lifetime') {
            const mwStats = new MWStats();
            const messageEmbed = mwStats.getLifetimeStats(data);
            message.channel.send(messageEmbed);
            return;
        } else {
            const mwStats = new MWStats();
            if (!mwStats.modes.hasOwnProperty(mode)) {
                return message.reply("Invalid gamemode, try: '!mw modes' to see valid gamemodes.");
            }
            const embed = mwStats.getStatsForMode(data, mode);
            message.channel.send({ embed });
            return;
        }

    }
    catch (err) {
        logger.error(err);
    }
}

const determineUserAndPlatform = async message => {
    const regex = /^\!mw (.* ) (battle|psn|xbl|uno) (.*)$/;
    const matches = message.content.match(regex);
    if (matches) {
        return {
            mode: matches[1] != null ? matches[1].trim() : 'br_all',
            platform: matches[2],
            username: matches[3]
        };
    }

    const storedUserRegex = /^\!mw(.*)$/;
    const matchesStoredUser = message.content.match(storedUserRegex);
    if (matchesStoredUser) {
        const userDb = new UserDB();
        const storedUser = await userDb.getUser(message);
        if (storedUser) {
            return {
                platform: storedUser.platform,
                mode: matchesStoredUser[1] ? matchesStoredUser[1].trim() : 'br_all',
                username: storedUser.username
            };
        }
    }

    return null;
}

const saveUser = async message => {
    const regex = /^\!mw set (battle|psn|xbl|uno) (.*)$/;
    const matches = message.content.match(regex);
    if (!matches) {
        return message.reply("Invalid format, try: !mw set <platform> <username>");
    }
    const platform = matches[1];
    const username = matches[2];
    const userDb = new UserDB();
    await userDb.storeUser(message, platform, username);
    return true;
}

const getModes = async message => {
    const mwStats = new MWStats();
    const embed = mwStats.getModes();
    message.channel.send({ embed });
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
    } catch (error) {
        loggedIn = false;
        logger.error(error);
    } finally {
        loggedIn = true;
    }
});

/**
 * This event is triggered when the mw-warzone-bot receives a message.
 */
bot.on('message', async message => {
    if (message.author.bot) return;

    if (!message.content.startsWith(config.prefix)) return;

    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    logger.debug(`command: ${command}`);

    switch (command) {
        case "help":
            showHelp(message);
            break;
        case "set":
            saveUser(message);
            break;
        case "modes":
            getModes(message);
            break;
        default:
            getUserStats(message);
            break;
    }
});

bot.on('debug', logger.debug);

// Login the mw-warzone-bot to all registered Discord servers.
bot.login(auth.token);
