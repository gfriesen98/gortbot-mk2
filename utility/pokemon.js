const { getPokemon, getMoves } = require('../utility/pokeapi');
const { getRandomInt, calculateDamage, getBattleRandomNum } = require('./math');
const { HARDY, LONELY, BRAVE, 
    ADAMANT, NAUGHTY, DOCILE,
    BOLD, RELAXED, IMPISH,
    LAX, SERIOUS, TIMID,
    HASTY, JOLLY, NAIVE,
    BASHFUL, MODEST, MILD,
    QUIET, RASH, QUIRKY,
    CALM, GENTLE, SASSY,
    CAREFUL
} = require('../assets/natures');
const { results: POKEMON } = require('../assets/pokemon.json');
const NATURES = [
    HARDY, LONELY, BRAVE, 
    ADAMANT, NAUGHTY, DOCILE,
    BOLD, RELAXED, IMPISH,
    LAX, SERIOUS, TIMID,
    HASTY, JOLLY, NAIVE,
    BASHFUL, MODEST, MILD,
    QUIET, RASH, QUIRKY,
    CALM, GENTLE, SASSY,
    CAREFUL
];

/**
 * Calculate a pokemons real stat value
 * @param {string} name Stat name
 * @param {Object} nature Pokemons Nature Multipliers
 * @param {number} B Stats Base value
 * @param {number} I Stats Induvidual value
 * @param {number} E Stats Effort value
 * @param {number} L Pokemons Level
 * @returns {number} Calculated stat value
 */
function calculateStat(name, nature, B, I, E, L) {
    const {increases, decreases} = nature;
    let m = 0;
    if (increases.type === name) {
        m = increases.multiplier;
    } else if (decreases.type === name) {
        m = decreases.multiplier;
    } else {
        m = 1;
    }

    let stat = makeStat(m, B, I, E, L);
    return stat;
}

function makeStat(N, B, I, E, L) {
    return Math.floor(Math.floor((2 * B + I + E) * L / 100 + 5) * N);
}

/**
 * Calculates a pokemons health value
 * @param {number} B Stats Base value
 * @param {number} I Stats Induvidual value
 * @param {number} E Stats Effort value
 * @param {number} L Pokemons level
 * @returns 
 */
function calculateHPStat(B, I, E, L) {
    let stat = Math.floor((2 * B + I + E) * L / 100 + L + 10);
    return stat;
}

function getMove(moveset, len) {
    return moveset[getRandomInt(0, len)];
}

/**
 * Function to run attack checks to determine if
 * the defending pokemon gets killed or not.
 * 
 * @todo Generalize the damage calculation to also deal with fixed damage and other effects
 * @param {object} attacker Attacking pokemon
 * @param {object} defender Defending pokemon
 * @param {object} move Attacking move
 * @param {number} defenderHP Defender HP
 * @returns {newHP, isDead, dmg}
 */
function dealDamage(attacker, defender, move, defenderHP) {
    let isDead = false;
    if (typeof(move.power) === 'undefined') return {newHP: undefined, isDead: false, dmg: 0};
    let dmg = Math.floor(
        calculateDamage(
            attacker.level, move.power,
            attacker.stats[1].real_stat, defender.stats[2].real_stat,
            1, 1, 1, getBattleRandomNum(), 1, 1, 1, 1
        )
    );
    let newHP = defenderHP - dmg;
    if (newHP <= 0) {
        isDead = true;
    }
    return {newHP, isDead, dmg};
}

module.exports = {
    generateTeam: async function (partyLength) {
        const MAX = POKEMON.length;
        const PKMN_LEVEL = 100;
        const RANDOM_VALUE = getRandomInt(0, NATURES.length-1);
        const NATURE = NATURES[RANDOM_VALUE];
        let MAX_EVS = 510;
        const idxArray = [...Array(Number(partyLength)).keys()].map(n => {
            return getRandomInt(0, MAX);
        });
        console.log(idxArray)
        let team = [];

        console.log('LVL: ' + PKMN_LEVEL);
        console.log('Randomizer Value: ' + RANDOM_VALUE);
        console.log('Nature: ' + NATURE.name);

        for (const i of idxArray) {
            console.log(i);
            const poke = POKEMON[i];
            const poke_data = await getPokemon(poke);
            console.log(poke_data);
            const moves = poke_data.pokemon.moves.length > 0 ?
                await getMoves(poke_data.pokemon.moves) : [];
            let tempAbility = poke_data.pokemon.abilities.filter(n => {
                if (!n.is_hidden) {
                    return n.ability.name
                }
            });
            const ability = tempAbility[getRandomInt(0, tempAbility.length)];
            const hidden_ability = poke_data.pokemon.abilities.filter(n => {
                if (n.is_hidden) {
                    return n.ability.name
                }
            });
            const stats = [];
            for (const [i, n] of poke_data.pokemon.stats.entries()) {
                const statName = n.stat.name;
                const randomEVIndex = getRandomInt(0, poke_data.pokemon.stats.length);
                const IV = getRandomInt(0, 31);
                let EV = 0;
                /**
                 * Randomize EVS
                 * If randomEVIndex equals the current index:
                 *  generate EV from 0 to a max of 252
                 *      if > available total EVs
                 *          assign EV as difference (temp - MAX)
                 *      else
                 *          assign EV
                 */
                if (randomEVIndex === i && MAX_EVS > 0) {
                    let randomEV = getRandomInt(0, 252);
                    if (randomEV > MAX_EVS) {
                        EV = randomEV - MAX_EVS;
                        MAX_EVS = MAX_EVS - EV;
                    } else if (randomEV < MAX_EVS) {
                        MAX_EVS = MAX_EVS - randomEV;
                        EV = randomEV;
                    } else {
                        EV = 0;
                    }
                }

                if (statName === 'hp') {
                    stats.push({
                        name: statName,
                        base_stat: n.base_stat,
                        real_stat: calculateHPStat(n.base_stat, IV, EV, PKMN_LEVEL)
                    });
                } else {
                    stats.push({
                        name: statName,
                        base_stat: n.base_stat,
                        real_stat: calculateStat(statName, NATURE, n.base_stat, IV, EV, PKMN_LEVEL)
                    });
                }
            }

            const pokedata = {
                name: poke_data.pokemon.name,
                level: PKMN_LEVEL,
                types: 
                    poke_data.pokemon.types.length === 1 ?
                        [poke_data.pokemon.types[0].type.name]
                    :   [poke_data.pokemon.types[0].type.name, poke_data.pokemon.types[1].type.name],
                moveset: moves,
                stats: stats,
                ability: ability,
                hiddenAbility: hidden_ability
            }
            team.push(pokedata);
        }
        return team;
    },

    /**
     * Runs the steps needed to simulate one turn
     * of a pokemon battle
     */
    turn(playerMon, enemyMon, turn, NAME, ENEMYNAME, deathType) {
        const LOG = [];

        const MOVE = getMove(playerMon.moveset, playerMon.moveset.length - 1);
        let playerHP = playerMon.stats[0].real_stat;

        const ENEMYMOVE = getMove(enemyMon.moveset, enemyMon.moveset.length - 1);
        let enemyHP = enemyMon.stats[0].real_stat;

        if (turn == 1) {
            LOG.push(`${NAME} brought out ${playerMon.name}!`);
            LOG.push(`${ENEMYNAME} brought out ${enemyMon.name}!`);
        }

        if (deathType === 'player') {
            LOG.push(`${NAME} brought out ${playerMon.name}`);
        } else if (deathType === 'enemy') {
            LOG.push(`${ENEMYNAME} brought out ${enemyMon.name}!`);
        }

        LOG.push(`TURN ${turn}`);
        LOG.push(`${playerMon.name}: ${playerHP} HP\n${enemyMon.name}: ${enemyHP} HP`);

        /**
         * @todo add:
         *  speed check
         *  accuracy check
         * 
         * lets just do a coin flip for now
         *  0 - player, 1 - enemy
        */
        let playerGoesFirst = getRandomInt(0, 1) == 1 ? true : false;
        if (playerGoesFirst) {
            let { newHP, isDead, dmg } = dealDamage(playerMon, enemyMon, MOVE, enemyHP);
            LOG.push(`${NAME}'s ${playerMon.name} used ${MOVE.name}!`);
            LOG.push(`${enemyMon.name} took ${dmg} damage!`);
            if (isDead) {
                LOG.push(`${ENEMYNAME}'s ${enemyMon.name} fainted!`);
                return { turnLog: LOG, death: { who: 'enemy', isDead: true } };
            }
            let { EnewHP, EisDead, Edmg } = dealDamage(enemyMon, playerMon, ENEMYMOVE, playerHP);
            LOG.push(`${ENEMYNAME}'s ${enemyMon.name} used ${ENEMYMOVE.name}!`);
            LOG.push(`${playerMon.name} took ${Edmg} damage!`);
            if (EisDead) {
                LOG.push(`${NAME}'s ${playerMon.name} fainted!`);
                return { turnLog: LOG, death: { who: 'player', isDead: true } };
            }
            return { turnLog: LOG, death: { who: 'nobody', isDead: false }, playerHP: EnewHP, enemyHP: newHP };

        } else {
            let { newHP, isDead, dmg } = dealDamage(enemyMon, playerMon, ENEMYMOVE, playerHP);
            LOG.push(`${ENEMYNAME}'s ${enemyMon.name} used ${ENEMYMOVE.name}!`);
            LOG.push(`${playerMon.name} took ${dmg} damage!`);
            if (isDead) {
                LOG.push(`${NAME}'s ${playerMon.name} fainted!`);
                return { turnLog: LOG, death: { who: 'player', isDead: true } };
            }
            let { EnewHP, EisDead, Edmg } = dealDamage(playerMon, enemyMon, MOVE, enemyHP);
            LOG.push(`${NAME}'s ${playerMon.name} used ${MOVE.name}!`);
            LOG.push(`${enemyMon.name} took ${Edmg} damage!`);
            if (EisDead) {
                LOG.push(`${ENEMYNAME}'s ${enemyMon.name} fainted!`);
                return { turnLog: LOG, death: { who: 'enemy', isDead: true } };
            }
            return { turnLog: LOG, death: { who: 'nobody', isDead: false }, playerHP: newHP, enemyHP: EnewHP };
        }
        
    }
}