require('./connection.js');
const axios = require('axios');
const Rom = require('../db/models/rom');
// /home/garett/drive1/Roms/NEOGEO/neogeo.zip
// /home/garett/drive1/Roms/NEOGEO/magdrop3.zip

async function poop() {
    const rom = new Rom({
        title: 'neogeo',
        path: '/home/garett/drive1/Roms/NEOGEO/neogeo.zip',
        category: 'neogeo',
        size: '1.60MB',
        bios: true
    });

    const rom2 = new Rom({
        title: 'magical drop 3',
        path: '/home/garett/drive1/Roms/NEOGEO/magdrop3.zip',
        category: 'neogeo',
        size: '8.15MB',
    });

    const res = await rom.save();
    console.log(res);
    const res2 = await rom2.save();
    console.log(res2);

}

poop();
