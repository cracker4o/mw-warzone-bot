import {MWStats} from './../components/mw-stats';

export class GetModesCommand {
    static getCommand() {
        return 'modes';
    }

    static create(message, logger) {
        return new GetModesCommand(message, logger);
    }

    constructor(message, logger) {
        this.message = message;
        this.logger = logger;
    }

    execute() {
        const mwStats = new MWStats();
        const embed = mwStats.getModes();
        this.message.channel.send({ embed });

        return true;
    }
}