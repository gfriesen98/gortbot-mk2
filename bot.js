require('dotenv').config();
require('./db/connection');
const TOKEN = process.env.TOKEN;
const GUILD = process.env.GUILD;
const {Client, Intents, Collection, IntegrationApplication} = require('discord.js');
const colors = require('colors');
const P = process.env.PREFIX;
const fs = require('fs');

const client = new Client({ intents: [
    Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES,
    Intents.FLAGS.GUILD_MESSAGES
]});
client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
}

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        await command.execute(interaction, client);
    } catch (err) {
        console.error(err);
        await interaction.reply({ content: 'There was an error running this command.', ephemeral: true});
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

client.login(TOKEN);