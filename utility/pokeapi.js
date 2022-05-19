const Axios = require('axios').default;
const pfs = require('fs/promises');
const { getRandomInt } = require('./math');

module.exports = {

    /**
     * Get pokemons data
     * 
     * Checks if pokemon data exists locally,
     * downloads from pokeapi if not.
     * 
     * Return object containing pokemon data
     * @param {Object} poke Pokemon object
     * @returns pokemon data
     */
    getPokemon: async function (poke) {
        const filename = `${poke.name}.json`;
        try {
            await pfs.access(`/home/garett/gortbot-mk2/assets/pokemon/${filename}`);
            console.log(`${poke.name} exists in assets/pokemon`);
            let data = await pfs.readFile(`/home/garett/gortbot-mk2/assets/pokemon/${filename}`);
            let p = JSON.parse(data);
            return { success: true, pokemon: p };
        } catch (err) {
            console.log(`${poke.name} will be downloaded and saved`);
            let res = await Axios.get(poke.url);
            let data = JSON.stringify(res.data);
            try {
                await pfs.writeFile(`/home/garett/gortbot-mk2/assets/pokemon/${filename}`, data);
            } catch (err) {
                console.error(err);
                return { success: false };
            }
            console.log(`${poke.name} written`);
            return { success: true, pokemon: res.data };
        }
    },

    /**
     * Get a pokemons moveset
     * 
     * If move data does not exist locally,
     * download it from pokeapi
     * 
     * Gather relevant data for each move
     * 
     * Return an array of four moves
     * 
     * @param {Array} moves moves array
     * @returns moveset
     */
    getMoves: async function (moves) {
        if (moves === [] || typeof(moves) === 'undefined') return []; // handful of pokemon from the api dont have moves set
        const moveset = [];
        let m = [];
        for (let i = 0; i < 4; i++) {
            m.push(moves[getRandomInt(0, moves.length-1)]);
        }
        console.log(m, moves);
        // replace possible duplicates with new numbers
        let seen = new Set();
        m.forEach((n, i) => {
            while(seen.has(n)) {
                m[i] = n = moves[getRandomInt(0, moves.length)];
            }
            seen.add(n);
        });

        for (const n of m) {
            if (typeof(n) === 'undefined') return console.error('Move is undefined for no reason');
            try {
                await pfs.access(`/home/garett/gortbot-mk2/assets/moves/${n.move.name}.json`);
                console.log(`${n.move.name} exists`);
                const temp = await getMoveJSON(`${n.move.name}.json`);
                moveset.push(temp);
            } catch (err) {
                console.log(`${n.move.name} doesnt exist`);
                try {
                    const res = await Axios.get(n.move.url);
                    let data = JSON.stringify(res.data);
                    await pfs.writeFile(`/home/garett/gortbot-mk2/assets/moves/${n.move.name}.json`, data);
                    console.log(`${n.move.name} written`);
                    const temp = await getMoveJSON(`${n.move.name}.json`);
                    moveset.push(temp);
                } catch (err2) {
                    console.log(`could not download ${n.move.name}, skipping...`);
                }
            }
        }
        console.log(moveset);
        return moveset;
    },

    /**
     * @todo
     * Get a pokemons ability
     */
    getAbility: async function (abilities) {
        
    },

    /**
     * @todo
     * Get a held item for a pokemon
     */
    getItem: async function () {

    }
}

async function getMoveJSON(filename) {
    try {
        const temp = await pfs.readFile(`/home/garett/gortbot-mk2/assets/moves/${filename}`);
        let data = JSON.parse(temp);
        return {
            name: data.name,
            power: data.power,
            pp: data.pp,
            accuracy: data.accuracy,
            hitsAll: data.target.name == 'all-opponents' ? true : false,
            type: data.type.name,
            priority: data.priority,
            meta: data.meta
        }
    } catch (err) {
        return null;
    }

}