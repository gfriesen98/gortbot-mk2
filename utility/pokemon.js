const { getPokemon, getMoves } = require('../utility/pokeapi');
const { getRandomInt } = require('../utility/randomizers');
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
     * Calculates the damage delt to the target pokemon
     * 
     * @param {number} Level Pokemons level
     * @param {number} Power Move Power
     * @param {number} A     Attacking Pokemons Attack
     * @param {number} D     Target Pokemons Defense
     * @param {number} Targets Number of Targets
     * @param {number} Weather Weather Multiplier
     * @param {number} Critical Critical Hit Multiplier
     * @param {number} random Random multiplier
     * @param {number} STAB Same Type Attack Bonus
     * @param {number} Type Type Effectiveness Multiplier
     * @param {number} Burn Burn Multiplier
     * @param {number} other Other (stacked) Effects
     * @returns Damage delt to target pokemon
     */
    calculateDamage(Level, Power, A, D, Targets, Weather, Critical, random, STAB, Type, Burn, other) {
        let bracket1 = (2 * Level)/5;
        let bracket2 = ((bracket1+2)*Power*(A/D)/50)+2;
        // let brackets = 2 + (((2 + (Level*2)/5)*Power*(A/D))/5);
        return bracket2 * Targets * Weather * Critical * random * STAB * Type * Burn * other;
    },

    turn() {

    }
}