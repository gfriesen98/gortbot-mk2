const {connect} = require('./connection.js');
const axios = require('axios');
const Rom = require('../db/models/rom');
// /home/garett/drive1/Roms/NEOGEO/neogeo.zip
// /home/garett/drive1/Roms/NEOGEO/magdrop3.zip

async function poop() {
    console.log(process.env.DB_USERNAME);
    connect();
    const rom = new Rom({
        name: 'neogeo',
        path: '/home/garett/drive1/Roms/NEOGEO/neogeo.zip',
        category: 'neogeo',
        filesize: '1.60MB',
    });

    const rom2 = new Rom({
        name: 'magical drop 3',
        path: '/home/garett/drive1/Roms/NEOGEO/magdrop3.zip',
        category: 'neogeo',
        filesize: '8.15MB',
    });

    const res = await rom.save();
    console.log(res);
    const res2 = await rom2.save();
    console.log(res2);

}

poop();
