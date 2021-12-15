const fs = require('fs').promises;
async function test(){
    await fs.access('/tmp/currently-playing.json');
}

test();
