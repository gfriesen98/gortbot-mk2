const Axios = require('axios');
const pfs = require('fs/promises');
const { getRandomInt } = require('../utility/randomizers');

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
            const data = await pfs.readFile(`/home/garett/gortbot-mk2/assets/pokemon/${filename}`);
            const p = JSON.parse(data);
            return { success: true, pokemon: p };
        } catch (err) {
            console.log(`${poke.name} will be downloaded and saved`);
            const res = await Axios.get(poke.url);
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
        const moveset = [];
        let m = [];
        for (let i = 0; i < 4; i++) {
            m.push(moves[getRandomInt(0, moves.length)]);
        }
        // replace possible duplicates with new numbers
        m = m.filter((n, i) => {
            if (m.indexOf(n) != i) {
                return getRandomInt(0, moves.length);
            } else {
                return n;
            }
        });

        for (const n of m) {
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