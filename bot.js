require('dotenv').config();
require('./db/connection');
const fs = require('fs');
const colors = require('colors');
const TOKEN = process.env.TOKEN;
const GUILD = process.env.GUILD;
const P = process.env.PREFIX;
const audio = require('./commands/audio');

const {
    Client, Intents, 
    Collection, IntegrationApplication
} = require('discord.js');

const client = new Client({ intents: [
    Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES,
    Intents.FLAGS.GUILD_MESSAGES
]});

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

        case 'g!test': 
            audio.test(message);
            break;
        default:
            message.channel.send('Not a command there buddy ok? You stupid little guy huh? Yeah thats right. Stupid, and small.');
    }

});

client.once('ready', () => {
    console.log('gortbot:'.yellow+" READY".green);
});

client.once('reconnecting', () => {
    console.log('gortbot:'.yellow+" RECONNECTING".yellow);
});

client.once('disconnect', () => {
    console.log('gortbot:'.yellow+" DISCONNECTED".blue);
});

client.login(TOKEN);