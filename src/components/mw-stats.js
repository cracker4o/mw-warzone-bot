import { MessageEmbed } from 'discord.js';

export class MWStats {
    constructor() {
        this.items = {
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
        };

        this.modes = {
            gun: 'Gun Fight',
            dom: 'Domination',
            war: 'Team Deathmatch',
            hq: 'Headquarters',
            hc_dom: 'Domination Hardcore',
            hc_conf: 'Kill Confirmed Hardcore',
            koth: 'Hardpoint',
            conf: 'Kill Confirmed',
            hc_hq: 'Headquarters Hardcore',
            arena: '2v2',
            br_dmz: 'Plunder',
            br: 'Warzone',
            sd: 'Search and Destroy',
            grnd: 'Grind',
            cyber: 'Cyber Attack',
            hc_war: 'Team Deathmatch Hardcore',
            br_all: 'Warzone',
            hc_sd: 'Search and Destroy Hardcore',
            arm: 'Ground War',
            hc_cyber: 'Cyber Attack Hardcore',
            infect: 'Infected'
        };
    }

    getModes() {
        let embed = new MessageEmbed()
            .setColor(0x00AE86)
            .setTitle('Valid Gamemodes:');
        for (const [key, value] of Object.entries(this.modes)) {
            embed.addField(key, value, true);
        }
        return embed;
    }

    getWeaponMostKills(data) {
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
        if (this.items.hasOwnProperty(w)) {
            weaponName = this.items[w];
        }
        return {
            weapon: weaponName,
            kills: k
        };
    }

    /**
     * Gets the lifetime stats for a MW user
     * @param {*} data JSON data object
     */
    getLifetimeStats(data) {
        const lifetime = data.lifetime.all.properties;
        const weaponMostKills = this.getWeaponMostKills(data);
        return new MessageEmbed()
            .setColor(0x00AE86)
            .setTitle(`${data.username}` + '\'s Lifetime Stats')
            .addFields(
                {
                    name: 'Level', value: data.level, inline: true
                },
                {
                    name: 'Time Played', value: `${(lifetime.timePlayedTotal / 3600).toFixed(2)}h`, inline: true
                },
                {
                    name: 'Best K/D', value: lifetime.bestKD, inline: true
                },
                {
                    name: 'K/D', value: lifetime.kdRatio.toFixed(2), inline: true
                },
                {
                    name: 'W/L', value: lifetime.wlRatio.toFixed(2), inline: true
                },
                {
                    name: 'ACC', value: `${lifetime.accuracy.toFixed(2)}%`, inline: true
                },
                {
                    name: 'Kills', value: lifetime.kills, inline: true
                },
                {
                    name: 'Headshots', value: `${lifetime.headshots} (${((lifetime.headshots / lifetime.kills) * 100).toFixed(2)}%)`, inline: true
                },
                {
                    name: 'Best Killstreak', value: lifetime.bestKillStreak, inline: true
                },
                {
                    name: 'Most Kills', value: lifetime.bestKills, inline: true
                },
                {
                    name: 'Most Deaths', value: lifetime.recordDeathsInAMatch, inline: true
                },
                {
                    name: 'Longest Winstreak', value: lifetime.recordLongestWinStreak, inline: true
                },
                {
                    name: 'Score/min', value: `${lifetime.scorePerMinute.toFixed(0)}`, inline: true
                },
                {
                    name: 'Most Used Weapon', value: `${weaponMostKills.weapon} (${weaponMostKills.kills} kills)`, inline: true
                },
            )
    };

    /**
     * Gets the stats for a MW user for a specific mode
     * @param {*} data JSON data object
     */
    getStatsForMode(data, mode) {

        const props = data.lifetime.mode[mode].properties;

        const embed = new MessageEmbed()
            .setColor(0x00AE86)
            .setTitle(`${data.username}\'s ${this.modes[mode]} Stats`);

        if (props.hasOwnProperty('wins')) {
            embed.addField('Wins', `${props.wins} (${(props.wins/props.gamesPlayed).toFixed(2)} %)`, true);
        }

        if (props.hasOwnProperty('topFive')) {
            embed.addField('Top 5', `${props.topFive} (${(props.topFive/props.gamesPlayed).toFixed(2)} %)`, true);
        }

        if (props.hasOwnProperty('topTen')) {
            embed.addField('Top 10', `${props.topTen} (${(props.topTen/props.gamesPlayed).toFixed(2)} %)`, true);
        }

        if (props.hasOwnProperty('topTwentyFive')) {
            embed.addField('Top 25', `${props.topTwentyFive} (${(props.topTwentyFive/props.gamesPlayed).toFixed(2)} %)`, true);
        }

        if (props.hasOwnProperty('cash')) {
            embed.addField('Cash', props.cash, true);
        }

        embed.addFields(
            {
                name: 'Time Played', value: `${(props.timePlayed / 3600).toFixed(2)}h`, inline: true
            },
            {
                name: 'K/D', value: props.kdRatio.toFixed(2), inline: true
            },
            {
                name: 'Kills', value: props.kills, inline: true
            },
            {
                name: 'Score/min', value: `${props.scorePerMinute.toFixed(0)}`, inline: true
            }
        );

        if (props.hasOwnProperty('downs')) {
            embed.addField('Downs', props.downs, true);
        }

        if (props.hasOwnProperty('revives')) {
            embed.addField('Revives', props.revives, true);
        }

        if (props.hasOwnProperty('contracts')) {
            embed.addField('Contracts', props.contracts, true);
        }

        if (props.hasOwnProperty('setBacks')) {
            embed.addField('Set Backs', props.setBacks, true);
        }

        if (props.hasOwnProperty('stabs')) {
            embed.addField('Stabs', props.stabs, true);
        }

        if (props.hasOwnProperty('captures')) {
            embed.addField('Captures', props.captures, true);
        }

        if (props.hasOwnProperty('defends')) {
            embed.addField('Defends', props.defends, true);
        }

        if (props.hasOwnProperty('assists')) {
            embed.addField('Assists', props.assists, true);
        }

        if (props.hasOwnProperty('confirms')) {
            embed.addField('Confirms', props.confirms, true);
        }

        if (props.hasOwnProperty('denies')) {
            embed.addField('Denies', props.denies, true);
        }

        if (props.hasOwnProperty('objTime')) {
            embed.addField('Objective Time', `${(props.objTime / 3600).toFixed(2)}h`, true);
        }

        if (props.hasOwnProperty('plants')) {
            embed.addField('Plants', props.plants, true);
        }

        if (props.hasOwnProperty('defuses')) {
            embed.addField('Defuses', props.defuses, true);
        }

        if (props.hasOwnProperty('infected')) {
            embed.addField('Infected', props.infected, true);
        }

        return embed;
    }
}