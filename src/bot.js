const Discord = require('discord.js');
const logger = require('winston');
const auth = require('./auth.json');
const fetch = require('node-fetch');
const API = require('call-of-duty-api')();
const sqlite3 = require('sqlite3').verbose();

// Configure the console logger settings
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';

// Initialize the Discord Bot
const bot = new Discord.Client();
let loggedIn = false;

// Initialize database
let db = new sqlite3.Database('./user.db', (err) => {
    if (err) {
      return console.error(err.message);
    }
    logger.debug('Connected to the SQlite database.');
  });

initTables();

process.on('exit', function(code) {
    db.close((err) => {
        if (err) {
          return console.error(err.message);
        }
        console.log('Close the database connection.');
      });
})

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
        message.channel.send({ embed });
    }
}

/**
 * Gets user's stats
 */
function getUserStats(message) {
    const botRegex = /^\!mw/;
    const botMatches = message.content.match(botRegex);
    if (!botMatches) {
        return;
    }

    const regex = /^\!mw (battle|psn|xbl|uno) (.* )?(.*)$/;
    const matches = message.content.match(regex);
    
    var platform, mode, username;
    if (matches) {
        platform = matches[1];
        mode = matches[2] != null ? matches[2].trim() : 'br_all';
        username = matches[3];
    } else {
        getUser(message).then((user) => {
            if (!user) {
                return;
            } else {
                platform = user.platform;
                username = user.username;
                mode = 'lifetime';
            }
        })
    }

    if (!API.platforms[platform]) {
        logger.warn('Invalid platform');
        return;
    }

    API.MWstats(username, API.platforms[platform])
        .then((output) => {
            logger.info(JSON.stringify(output));

            switch (mode) {
                case 'lifetime':
                    const messageEmbed = getLifetimeStats(output);
                    message.channel.send(messageEmbed);
                    return;
                case 'set':
                    storeUser(message, platform, username);
                    return;
                default:

            }
            const embed = new Discord.MessageEmbed();
            embed.setTitle(`Modern Warfare stats for user: ${username}`)
                .setColor(0x00AE86)
                .setDescription('User Stats:')
                .addField("Warzone", JSON.stringify(output.lifetime.mode[mode].properties));
            message.channel.send({ embed });
        }).catch((err) => {
            logger.error(err);
        });

}

function getLifetimeStats(data) {
    const lifetime = data.lifetime.all.properties;
    const weaponMostKills = getWeaponMostKills(data);
    return new Discord.MessageEmbed()
        .setColor(0x00AE86)
        .setTitle(`${data.username}` + '\'s Lifetime Stats')
        .addFields(
            {
                name: "Level", value: data.level, inline: true
            },
            {
                name: "Time Played", value: `${(lifetime.timePlayedTotal / 3600).toFixed(2)}h`, inline: true
            },
            {
                name: "Best K/D", value: lifetime.bestKD, inline: true
            },
            {
                name: "K/D", value: lifetime.kdRatio.toFixed(2), inline: true
            },
            {
                name: "W/L", value: lifetime.wlRatio.toFixed(2), inline: true
            },
            {
                name: "ACC", value: `${lifetime.accuracy.toFixed(2)}%`, inline: true
            },
            {
                name: "Kills", value: lifetime.kills, inline: true
            },
            {
                name: "Headshots", value: `${lifetime.headshots} (${((lifetime.headshots / lifetime.kills) * 100).toFixed(2)}%)`, inline: true
            },
            {
                name: "Best Killstreak", value: lifetime.bestKillStreak, inline: true
            },
            {
                name: "Most Kills", value: lifetime.bestKills, inline: true
            },
            {
                name: "Most Deaths", value: lifetime.recordDeathsInAMatch, inline: true
            },
            {
                name: "Longest Winstreak", value: lifetime.recordLongestWinStreak, inline: true
            },
            {
                name: "Score/min", value: `${lifetime.scorePerMinute.toFixed(0)}`, inline: true
            },
            {
                name: "Most Used Weapon", value: `${weaponMostKills.weapon} (${weaponMostKills.kills} kills)`, inline: true
            },

        )
};

function getWeaponMostKills(data) {
    const itemCategories = Object.keys(data.lifetime.itemData);
    let w = '';
    let k = -1;
    for (const category of itemCategories) {
        const weapons = Object.keys(data.lifetime.itemData[category]);
        for (const weapon of weapons) {
            if (data.lifetime.itemData[category][weapon].properties.kills > k) {
                k = data.lifetime.itemData[category][weapon].properties.kills;
                w = weapon;
            }
        }
    }
    let weaponName = 'unknown';
    if (items.hasOwnProperty(w)) {
        weaponName = items[w];
    }
    return {
        weapon: weaponName,
        kills: k
    };
}

const items = {
    iw8_sn_alpha50: 'AX-50',
    iw8_sn_hdromeo: 'HDR',
    iw8_sn_delta: 'Dragunov',
    iw8_sn_xmike109: 'Rytec AMR',
    equip_gas_grenade: 'Gas Grenade',
    equip_snapshot_grenade: 'Snapshot Grendade',
    equip_decoy: 'Decoy Grenade',
    equip_smoke: 'Smoke Grenade',
    equip_concussion: 'Stun Grenade',
    equip_hb_sensor: 'Heartbeat Sensor',
    equip_flash: 'Flash Grenade',
    equip_adrenaline: 'Stim',
    equip_frag: 'Frag Grenade',
    equip_thermite: 'Termite',
    equip_semtex: 'Semtex',
    equip_claymore: 'Claymore',
    equip_c4: 'C4',
    equip_at_mine: 'Proximity Mine',
    equip_throwing_knife: 'Throwing Knife',
    equip_molotov: 'Molotov Cocktail',
    iw8_lm_kilo121: 'M91',
    iw8_lm_mkilo3: 'Bruen Mk9',
    iw8_lm_mgolf34: 'MG34',
    iw8_lm_lima86: 'SA87',
    iw8_lm_pkilo: 'PKM',
    iw8_lm_mgolf36: 'Holger-26',
    iw8_la_gromeo: 'PILA',
    iw8_la_rpapa7: 'RPG-7',
    iw8_la_juliet: 'JOKR',
    iw8_la_kgolf: 'Strela-P',
    iw8_la_mike32: 'unknown launcher',
    iw8_pi_cpapa: '.357',
    iw8_pi_mike9: 'Renetti',
    iw8_pi_mike1911: '1911',
    iw8_pi_golf21: 'X16',
    iw8_pi_decho: '.50 GS',
    iw8_pi_papa320: 'M19',
    iw8_ar_falima: 'FAL',
    iw8_ar_tango21: 'RAM-7',
    iw8_ar_mike4: 'M4A1',
    iw8_ar_anovember94: 'AN-94',
    iw8_ar_falpha: 'FR 5.56',
    iw8_ar_mcharlie: 'M13',
    iw8_ar_akilo47: 'AK-47',
    iw8_ar_kilo433: 'Kilo 141',
    iw8_ar_scharlie: 'FN Scar 17',
    iw8_ar_asierra12: 'Oden',
    iw8_ar_galima: 'CR-56 AMAX',
    iw8_ar_sierra552: 'Grau 5.56',
    iw8_me_riotshield: 'Riot Shield',
    iw8_sh_mike26: 'VLK Rogue',
    iw8_sh_charlie725: '725',
    iw8_sh_oscar12: 'Origin 12 Shotgun',
    iw8_sh_romeo870: 'Model 680',
    iw8_sh_dpapa12: 'R9-0 Shotgun',
    iw8_sm_mpapa7: 'MP7',
    iw8_sm_augolf: 'AUG',
    iw8_sm_papa90: 'P90',
    iw8_sm_charlie9: 'ISO',
    iw8_sm_mpapa5: 'MP5',
    iw8_sm_smgolf45: 'Striker 45',
    iw8_sm_beta: 'PP19 Bison',
    iw8_sm_victor: 'Fennec',
    iw8_sm_uzulu: 'Uzi',
    iw8_sn_sbeta: 'MK2 Carbine',
    iw8_sn_crossbow: 'Crossbow',
    iw8_sn_kilo98: 'Kar98k',
    iw8_sn_mike14: 'EBR-14',
    iw8_sn_sksierra: 'SKS',
    iw8_me_akimboblunt: 'Kali Sticks',
    iw8_me_akimboblades: 'Dual Kodachis',
    iw8_knife: 'Combat Knife'
}

function initTables() {
    db.run(`CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, user TEXT NOT NULL, number TEXT NOT NULL, platform TEXT NOT NULL, username TEXT NOT NULL)`)
}

function storeUser(message, platform, username) {
    db.run(`INSERT OR REPLACE INTO users(id, user, number, platform, username) VALUES(?, ?, ?, ?, ?)`, [message.author.id, message.author.username, message.author.discriminator, platform, username], function (err) {
        if (err) {
            message.channel.send(new Discord.MessageEmbed()
                .setColor(0x00AE86)
                .setTitle('Error saving user')
                .setDescription(err.message))
        } else {
            message.channel.send(new Discord.MessageEmbed()
                .setColor(0x00AE86)
                .setDescription(`Associated ${platform} user ${username} with Discord user ${message.author.username}#${message.author.discriminator}`));
        }
    });
}

function getUser(message) {
    return new Promise((resolve, reject) => {
        db.get(`SELECT platform, username FROM users WHERE id = ?`, [message.author.id], (err, row) => {
            if (err) {
                console.error(err.message);
                reject(err.message);
            } else {
                resolve(row);
            }
        });
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
