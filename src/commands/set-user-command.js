import { UserDB } from './../components/user-db';

export class SetUserCommand {
    static getCommand() {
        return 'set';
    }

    static create(message, logger) {
        return new SetUserCommand(message, logger);
    }

    constructor(message, logger) {
        this.message = message;
        this.logger = logger;
        this.regex = /^\!mw set (battle|psn|xbl|uno) (.*)$/;
    }

    async execute() {
        const matches = this.message.content.match(this.regex);
        if (!matches) {
            return this.message.reply("Invalid format, try: !mw set <platform> <username>");
        }
        const platform = matches[1];
        const username = matches[2];
        const userDb = new UserDB();
        try {
            await userDb.storeUser(this.message, platform, username);

            return true;
        } catch (error) {
            this.logger.error(error);
            return false;
        }
    }

}