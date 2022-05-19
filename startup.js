const pfs = require('fs/promises');
const fs = require('fs');
const colors = require('colors');
const folders = [process.env.GORTBOT_DIR, process.env.PLEX_DIR, '/tmp/gortbot/plex/img', process.env.POKEMON_DIR, process.env.LOGS_DIR];

/**
 * Checks if a folder exists
 * @param {string} dir absolute path directory
 * @returns {boolean}
 */
function checkFolderSync(dir) {
    try {
        fs.accessSync(dir);
        console.log(`startup: `.yellow+`${dir}`+` OK`.green);
        return true
    } catch (err) {
        return false;
    }
}

/**
 * Creates a folder synchronously
 * Process exits on error
 * @param {string} dir absolute path directory
 */
function createFolderSync(dir) {
    try {
        console.log(`created ${dir}`.dim.italic);
        fs.mkdirSync(dir);
    } catch (err) {
        console.error(err);
        process.exit();
    }
}

module.exports = {

    /**
     * Check for required temp folders on startup
     * Process exits on error
     */
    startup: () => {
        console.log('startup: '.yellow+' checking folders...'.italic);
        for (const folder of folders) {
            !checkFolderSync(folder) && createFolderSync(folder);
        }
    }
}