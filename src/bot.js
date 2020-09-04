import logger from 'winston';
import { Client, MessageEmbed } from 'discord.js';
import { MWStats } from './components/mw-stats';
import { UserDB } from './components/user-db';
import { api, platforms } from 'call-of-duty-api-es6';
import * as auth from './auth';
import * as config from './config';
import commands from './commands/commands';

export default class Bot {
    constructor() {
        this.API = new api();
        logger.remove(logger.transports.Console);
        logger.add(logger.transports.Console, {
            colorize: true
        });
        logger.level = 'debug';

        // Initialize the Discord Bot
        this.bot = new Client();
        let loggedIn = false;

        /**
         * This event is triggered when the mw-warzone-bot is connected to the Discord server.
         */
        this.bot.on('ready', async () => {
            logger.info('Connected');
            logger.info('Logged in as: ');
            logger.info(`${this.bot.user.username}-(${this.bot.user.id})`);

            // The CoD API requires a login from a dummy account.
            // This prevents the CoD servers from throttling requests.
            try {
                await this.API.login(auth.mwUser, auth.mwPassword);
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
        this.bot.on('message', async (message) => {

            if (message.author.bot) return;

            if (!message.content.startsWith(config.prefix)) return;
        
            const args = message.content
                .slice(config.prefix.length)
                .trim()
                .split(/ +/g);

            const command = args.shift().toLowerCase();
            logger.debug(`command: ${command}`);
            let commandExecution = false;
            // The following code dynamically gathers all commands and matches the command string.
            // If the command string is a match, then it executes the command.
            await this.asyncForEach(commands, async cmd => {
                if (cmd.getCommand() === command) {
                    const action = cmd.create(message, logger)
                    commandExecution = await action.execute();
                    return;
                }
            });

            if (commandExecution === false) {
                await this.getUserStats(message);
            }
        });

        this.bot.on('debug', logger.debug);

        // Login the mw-warzone-bot to all registered Discord servers.
        this.bot.login(auth.token).catch(error => {
            logger.error(error);
        });        
    }

    /**
     * Gets user's stats
     */
    async getUserStats(message) {
        const data = await this.determineUserAndPlatform(message);

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
            const data = await this.API.MWstats(username, platforms[platform]);

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

    async determineUserAndPlatform(message) {
        const regex = /^\!mw (.*) (battle|psn|xbl|uno) (.*)$/;
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

    async asyncForEach(array, callback) {
        for (let index = 0; index < array.length; index++) {
          await callback(array[index], index, array);
        }
    }    
}

// Start the bot
new Bot();