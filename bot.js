require('dotenv').config();
require('./db/connection');
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const pfs = fs.promises;
const Rom = require('./db/models/rom');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const colors = require('colors');
const https = require('https');
const audio = require('./commands/audio');
const movie = require('./commands/movie');
const TOKEN = process.env.TOKEN;
const GUILD = process.env.GUILD;
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

        case 'g!currentlyPlaying':
            const chat = client.channels.cache.get('920512105906593812');
            movie.currentlyPlaying(message, chat);
            break;
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
    if (payload.Player.uuid !== process.env.PLEX_PLAYER_UUID) return res.sendStatus(401);

    switch (payload.event) {
        case 'media.resume':
        case 'media.play':
            try {
                await pfs.writeFile('/tmp/plex/currently-playing.json', req.body.payload);
            } catch (err) {
                console.error("'/tmp/plex' does not exist");
            }
            client.user.setActivity(
                payload.Metadata.type == 'movie' ?
                    payload.Metadata.title
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
    console.log('express:'.yellow+'listening for plex webhooks'.green);
});


client.login(TOKEN);