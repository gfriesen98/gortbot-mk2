const { getPokemon, getMoves } = require('../utility/pokeapi');
const { getRandomInt } = require('../utility/randomizers');
const pfs = require('fs/promises');
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
const { results: POKEMON, count } = require('../assets/pokemon.json');
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

module.exports = {
    generateTeam: async function (partyLength) {
        const MAX = POKEMON.length;
        const PKMN_LEVEL = 50;
        const RANDOM_VALUE = getRandomInt(0, NATURES.length);
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
            const moves = await getMoves(poke_data.pokemon.moves);
            const stats = [];
            console.log(poke_data.pokemon.stats);
            for (const [i, n] of poke_data.pokemon.stats.entries()) {
                const statName = n.stat.name;
                const baseValues = n.stat.base_stat;
                const randomEVIndex = getRandomInt(0, poke_data.pokemon.stats.length);
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
                stats.push({
                    name: n.stat.name,
                    base_stat: n.base_stat,
                });
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
                ability: 'todo',
                hiddenAbility: 'todo'
            }
            team.push(pokedata);
        }
        return team;
    }

}