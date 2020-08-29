import logger from 'winston';
import {Client, MessageEmbed} from 'discord.js';
import {MWStats} from './components/mw-stats';
import {UserDB} from './components/user-db';
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
            .setDescription('MW Bot lets you get info about your user and some additional global stats')
            .setURL('https://github.com/cracker4o/mw-warzone-bot')
            .addField(`Check out the GitHub README for how to use the bot`)
            .setFooter(`The MW Api uses data from the callofduty.com API`)
        message.channel.send({ embed });
        return true;
    }
    return false;
}

/**
 * Gets user's stats
 */
const getUserStats = async (message) => {
    const botRegex = /^\!mw/;
    const botMatches = message.content.match(botRegex);
    if (!botMatches) {
        return;
    }
   
    const data = await determineUserAndPlatform(message);

    if (!data) {
        message.channel.send(new MessageEmbed()
            .setColor(0x00AE86)
            .setDescription(`No association found for ${message.author.username}#${message.author.discriminator}. Use '!mw <platform> set <username>' to associate yourself.`));
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
        // logger.info(JSON.stringify(data));

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

const determineUserAndPlatform = async (message) => {
    const regex = /^\!mw (battle|psn|xbl|uno) (.* )?(.*)$/;
    const matches = message.content.match(regex);
    if (matches) {
        return {
            platform: matches[1],
            mode: matches[2] != null ? matches[2].trim() : 'br_all',
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

const saveUser = async (message) => {
    const regex = /^\!mw (battle|psn|xbl|uno) (set) (.*)$/;
    const matches = message.content.match(regex);
    if (!matches) {
        return;
    }
    const platform = matches[1];
    const username = matches[3];
    const userDb = new UserDB();
    await userDb.storeUser(message, platform, username);
    return true;
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
    if (showHelp(message)) {
        return;
    }
    if (!await saveUser(message)) {
        await getUserStats(message);
    }
});

bot.on('debug', logger.debug);

// Login the mw-warzone-bot to all registered Discord servers.
bot.login(auth.token);
