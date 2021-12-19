const Axios = require('axios');
const pfs = require('fs/promises');
const path = require('path');

async function getPokemon() {
    const filename = `${poke.name}.json`;
    try {
        await pfs.access(`/home/garett/gortbot-mk2/assets/move/${filename}`);
        console.log(`${poke.name} exists in assets/pokemon`);
    } catch (err) {
        console.log(err);
        console.log(`${poke.name} will be downloaded and saved`);
        const res = await Axios.get(poke.url);
        let data = JSON.stringify(res.data);
        await pfs.writeFile(`/home/garett/gortbot-mk2/assets/pokemon/${filename}`, data);
        console.log('file written')
    }
}

getPokemon();