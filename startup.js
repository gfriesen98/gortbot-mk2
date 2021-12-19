const pfs = require('fs/promises');
const colors = require('colors');

async function checkFolders() {
    try {
        await pfs.access('/tmp/plex');
        console.log('startup: '.yellow+'folders exist'.green);
    } catch (err) {
        console.log('temporary plex folder does not exitst'.yellow);
        console.log('creating plex file structure'.yellow);
        await createFolders();
   }
}

async function createFolders() {
    try {
        await pfs.mkdir('/tmp/plex');
        await pfs.mkdir('/tmp/plex/img');
        await pfs.mkdir('/tmp/plex/lists');
        return true;
    } catch (err) {
        console.error(err);
        console.log('error creating folder structures'.bgRed.white);
        throw err;
    }
}

checkFolders();