const fs = require('fs');
const Axios = require('axios');
const stream = require('stream');
const util = require('util');
const pipeline = util.promisify(stream.pipeline);

var obj = {

    /**
     * Downloads an image to a directory
     * @param {string} url image url
     * @param {string} output_dir output directory
     * @returns {boolean} true on success, false on error
     */
    downloadFile: async function(url, output_dir) {
        try {
            const req = await Axios.get(url, { responseType: 'stream' });
            await pipeline(req.data, fs.createWriteStream(output_dir));
            console.log('downloaded file');
            return true;
        } catch (err) {
            console.error(err);
            return false;
        }
    }
};

module.exports = obj;