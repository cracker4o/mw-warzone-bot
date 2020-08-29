import * as Nedb from 'nedb';
import { MessageEmbed } from 'discord.js';

export class UserDB {
    constructor() {
        this.db = new Nedb('./user.db');
        this.db.loadDatabase();
    }

    async storeUser(message, platform, username) {
        const doc = {
            _id: message.author.id,
            user: message.author.username,
            number: message.author.discriminator,
            platform: platform,
            username: username
        };
        return new Promise((resolve, reject) => {
            this.db.insert(doc, function (err, newDoc) {
                if (err) {
                    message.channel.send(new MessageEmbed()
                        .setColor(0x00AE86)
                        .setTitle('Error saving user')
                        .setDescription(err.message));
                    reject(err);
                } else {
                    message.channel.send(new MessageEmbed()
                        .setColor(0x00AE86)
                        .setDescription(`Associated ${newDoc.platform} user ${newDoc.username} with Discord user ${newDoc.user}#${newDoc.number}`));
                    resolve();
                }
            });
        });
    }

    async getUser(message) {
        return new Promise((resolve, reject) => {
            this.db.findOne({ _id: message.author.id }, function (err, doc) {
                if (err) {
                    reject(err.message);
                } else {
                    resolve(doc);
                }
            });
        });
    }
}