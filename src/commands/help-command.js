import { MessageEmbed } from 'discord.js';

export class HelpCommand {
    static getCommand() {
        return 'help';
    }

    static create(message, logger) {
        return new HelpCommand(message, logger);
    }

    constructor(message, logger){
        this.message = message;
        this.logger = logger;
    }

    async execute() {
        try {
            const embed = new MessageEmbed();
            embed.setTitle('Modern Warfare Bot')
                .setColor(0x00AE86)
                .setDescription('MW Bot lets you get info about your user and some additional global stats. Click the link to go to the GitHub README for how to use the bot.')
                .setURL('https://github.com/cracker4o/mw-warzone-bot')
                .setFooter('The MW Api uses data from the callofduty.com API');

            this.message.channel.send({ embed });
    
            return Promise.resolve(true);;
        } catch (error) {
            this.logger.error(error);
            return Promise.resolve(false);;
        }
    }
}