import { Client, MessageEmbed } from 'discord.js';
import { UserDB } from './../components/user-db';
import { api, platforms } from 'call-of-duty-api-es6';
import _ from 'lodash';

export class CompareCommand {
    static getCommand() {
        return 'compare';
    }

    static create(message, logger, client) {
        return new CompareCommand(message, logger, client);
    }

    constructor(message, logger, client) {
        this.message = message;
        this.logger = logger;
        this.client = client;
        this.API = new api();
    }

    async execute() {
        try {
            let ids = [];
            for (const [key, value] of (this.client.users.cache.entries())) {
                if (!value.bot) {
                    ids.push(key);
                }
            }
            if (!ids.length) {

            }
            const userDb = new UserDB();
            let docs = await userDb.getUsers(ids);
            let stats = await Promise.all(docs.map(doc => this.API.MWstats(doc.username, doc.platform)));

            let embed = new MessageEmbed()
                .setColor(0x00AE86)
                .setTitle('Comparing Stats')
                .setDescription('Comparing lifetime stats for associated users in this channel')
                .addField("Kills", this.getOrderedPropertyString(stats, "lifetime.all.properties.kills", false), true)
                .addField("K/D", this.getOrderedPropertyString(stats, "lifetime.all.properties.kdRatio", true), true)
                .addField("W/L", this.getOrderedPropertyString(stats, "lifetime.all.properties.wlRatio", true), true)
                .addField("ACC", this.getOrderedPropertyString(stats, "lifetime.all.properties.accuracy", true), true)
                .addField("Most Kills", this.getOrderedPropertyString(stats, "lifetime.all.properties.bestKills", false), true)
                .addField("Most Deaths", this.getOrderedPropertyString(stats, "lifetime.all.properties.recordDeathsInAMatch", false), true)
                .addField("Best Killstreak", this.getOrderedPropertyString(stats, "lifetime.all.properties.bestKillStreak", false), true)
                .addField("Longest Winstreak", this.getOrderedPropertyString(stats, "lifetime.all.properties.recordLongestWinStreak", false), true)
                .setFooter("Don't see your name? Make sure you associate yourself with the bot: !mw set");

            this.message.channel.send({ embed });


            return Promise.resolve(true);;
        } catch (error) {
            this.logger.error(error);
            return Promise.resolve(false);;
        }
    }

    getOrderedPropertyString(stats, prop, fixed) {
        let temp = [];
        for (const stat of stats) {
            let obj = {
                name: stat.username.split('#')[0],
                value: _.get(stat, prop, "N/A")
            }
            if (fixed) {
                obj.value = `${obj.value.toFixed(2)}`
            }
            temp.push(obj);
        }
        temp.sort((a, b) => b.value - a.value)
        return temp.map(function (i) {
            return `${i.name} (${i.value})`
        })
            .join(', ');
    }
}