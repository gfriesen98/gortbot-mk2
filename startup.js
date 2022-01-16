const pfs = require('fs/promises');
const colors = require('colors');

async function checkFolders() {
    try {
        await pfs.access('/tmp/plex');
        await pfs.access('/tmp/pokemon_logs');
        console.log('startup: '.yellow+'folders exist'.green);
    } catch (err) {
        console.log('temporary folders do not exitst'.yellow);
        console.log('creating file structure...'.yellow);
        await createFolders();
   }
}

async function createFolders() {
    try {
        await pfs.mkdir('/tmp/plex');
        await pfs.mkdir('/tmp/plex/img');
        await pfs.mkdir('/tmp/plex/lists');
        await pfs.mkdir('/tmp/pokemon_logs');
        return true;
    } catch (err) {
        console.error(err);
        console.log('error creating folder structures'.bgRed.white);
        throw err;
    }
}

module.exports = {
    startup: () => {
        checkFolders();
    }
}