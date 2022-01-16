require('dotenv').config();
const {startup} = require('./startup')
const {connect} = require('./db/connection');
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const pfs = fs.promises;
const {promisify} = require('util');
const exec = promisify(require('child_process').exec);
const Rom = require('./db/models/rom');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const colors = require('colors');
const https = require('https');
const audio = require('./commands/audio');
const movie = require('./commands/movie');
const grievance = require('./commands/grievance');
const images = require('./commands/images');
const gambling = require('./commands/gambling');
const SECRET = process.env.SECRET;
const P = process.env.PREFIX;
const upload = multer({ dest: '/tmp/'});
const app = express();

const {
    Client, Intents, MessageAttachment,
    Collection, IntegrationApplication, MessageEmbed
} = require('discord.js');

const client = new Client({ intents: [
    Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES,
    Intents.FLAGS.GUILD_MESSAGES
]});

client.commands = new Collection();
const files = fs.readdirSync('./slash-commands/commands').filter(file => file.endsWith('.js'));
for (const file of files) {
    const command = require(`./slash-commands/commands/${file}`);
    client.commands.set(command.data.name, command);
}

client.on('messageCreate', async message => {
    if (message.author.bot) return;
    if (!message.content.startsWith(P)) return;

    const command = message.content.split(' ')[0]
    switch(command) {
        case 'g!play': 
            audio.setup(message);
            break;
        
        case 'g!pause':
            audio.pause(message);
            break;
        
        case 'g!stop':
            audio.stop(message);
            break;
        
        case 'g!skip':
            audio.skip(message);
            break;
        
        case 'g!resume':
            audio.resume(message);
            break;

        case 'g!next':
            audio.next(message);
            break;

        case 'g!inq': 
            audio.inQueue(message);
            break;

        case 'g!nowplaying':
            const chat = client.channels.cache.get('920512105906593812');
            movie.currentlyPlaying(message, chat);
            break;

        case 'g!movies':
            const args = message.content.split(' ');
            const command = await exec('bash scripts/movie-list.sh');
            console.log(args);
            if (args.length === 1) {
                if (command.stderr) {
                    console.log(command.stderr);
                    return null;
                }
                const attachment = new MessageAttachment('/tmp/plex/lists/movies.txt', 'movies.txt');
                return message.channel.send({files: [attachment]});
            } else {
                args.shift();
                const strings = args.join(" ");
                console.log(strings);
                try {
                    const command = await exec(`bash scripts/search.sh ${strings}`);
                    if (command.stderr) {
                        throw new Error(command.stderr);
                    }
    
                    if (command.stdout) {
                        return message.channel.send('```'+command.stdout+'```')
                    }
                } catch (err) {
                    return message.channel.send('No results :(');
                }
            }
            
        case 'g!points':
            gambling.points(message);
            break;

        case 'g!battle':
            gambling.battle(message);
            break;

        // case 'g!grieve':
        //     grievance.post(message);
        //     break;

        case 'g!giveme':
            images.giveme(message);
            break;

        case 'g!meme':
            images.meme(message);
            break;
        
        case 'g!help':
            const help = 
            `
            \`\`\`yaml
                ======  gortbot help ======
            music
                * need to be in a voice channel to use *
                - g!play [url: Youtube or Spotify]
                    - starts a queue/adds to queue
                - g!pause
                - g!stop
                - g!resume
                - g!skip
                - g!next
                    - shows upcoming information
            gambling
                - g!points
                    - your peepee points (work in progress)
            other
                - g!movies "optional search inside double quotes"
                    - shows my collection
                    - optionally add search text inside double quotes to search
                - g!nowplaying
                    - only works when the bots status is WATCHING [something]
                - g!meme
                    - shows a random image ive had saved on my phone
                - g!giveme
                    - give me a file (up to discords limit), thank you for your donation
            \`\`\`
            `;
            return message.channel.send(help, {ephemeral: true});
        default:
            message.channel.send('Not a command there buddy ok? You stupid little guy huh? Yeah thats right. Stupid, and small.');
    }

});

client.on('interactionCreate', async interaction => {
    if (interaction.isSelectMenu()) {
        if (interaction.customId === 'select') {
            console.log(interaction.values);
            await interaction.deferUpdate();
            const thing = await Rom.findById(interaction.values[0]);
            console.log(thing);
            if (thing.fileSize.includes(['B', 'kB'])) {
                const file = new MessageAttachment(thing.path);
                await interaction.editReply({ content: 'processing...', ephemeral: true, files: [file], components: []});

            } else if (thing.fileSize.includes('MB')) {
                const num = thing.fileSize.split(" ")[0];
                if (num > 8) {
                    const payload = {id: interaction.values[0], ttl: Date.now()}
                    const token = jwt.sign(payload, SECRET, {expiresIn: 300000});
                    const agent = new https.Agent({rejectUnauthorized: false})
                    const res = await axios(process.env.DL_URL, {headers: {
                        Cookie: `p=${token}`
                    }, httpsAgent: agent});
                    await interaction.editReply({content: `Here u go friend: ${res.data}`, ephemeral: true, components: []});

                } else {
                    const file = new MessageAttachment(thing.path);
                    await interaction.editReply({content: 'processing...', ephemeral: true, files: [file], components: []});
                }
            } else {
                const payload = {id: interaction.values[0], ttl: Date.now()}
                const token = jwt.sign(payload, SECRET, {expiresIn: 300000});
                const agent = new https.Agent({rejectUnauthorized: false})
                const res = await axios(process.env.DL_URL, {headers: {
                    Cookie: `p=${token}`
                }, httpsAgent: agent});
                await interaction.editReply({content: `Here u go friend: ${res.data}`, ephemeral: true, components: []});
            }
        }
    }
    if (!interaction.isCommand()) return;
    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (err) {
        console.error(err);
        await interaction.reply({content: 'ddhksjasdhjkkjasdhkjashdashjk', ephemeral: true});
    }
})

client.once('ready', () => {
    console.log('gortbot:'.yellow+" READY".green);
});

client.once('reconnecting', () => {
    console.log('gortbot:'.yellow+" RECONNECTING".yellow);
});

client.once('disconnect', () => {
    console.log('gortbot:'.yellow+" DISCONNECTED".blue);
});

app.post('/', upload.single('thumb'), async (req, res, next) => {
    const payload = JSON.parse(req.body.payload);
    if (payload.event !== 'library.new'){
        if (payload.Player.uuid !== process.env.PLEX_PLAYER_UUID) return res.sendStatus(401);
    }

    switch (payload.event) {
        case 'media.resume':
        case 'media.play':
            try {
                await pfs.writeFile('/tmp/plex/currently-playing.json', req.body.payload);
            } catch (err) {
                console.error("'/tmp/plex' does not exist");
            }
            client.user.setActivity(
                payload.Metadata.type == 'movie'
                    ?   payload.Metadata.title
                    :   payload.Metadata.grandparentTitle,
             {type: 'WATCHING'});
            return res.sendStatus(200);
        case 'media.pause':
        case 'media.stop':
            try {
                await pfs.rm('/tmp/plex/currently-playing.json');
            } catch (err) {
                console.error("'/tmp/plex/currently-playing.json' does not exist");
            }
            client.user.setActivity('');
            return res.sendStatus(200);
        case 'library.new':
            console.log(payload.Metadata);
            const chat = client.channels.cache.get('920512105906593812');
            return chat.send(`${payload.Metadata.title} added`);
        default:
            return res.sendStatus(400);
    }
});

app.use((req, res, next) => {
    const err = new Error('not found');
    err.status = 404;
    next(err);
});

app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.send(err.message);
});

app.listen(10000, () => {
    console.log('express: '.yellow+'listening for plex webhooks'.green);
});

connect();
startup();
client.login(process.env.DISCORD_TOKEN);