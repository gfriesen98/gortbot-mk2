#!/usr/bin/node
require('dotenv').config();
const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fs = require('fs');
const colors = require('colors');
const GUILD = process.env.GUILD;
const CLIENT = process.env.CLIENT;
const TOKEN = process.env.TOKEN;

const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for(const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands.push(command.data.toJSON());
}

const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.log('deploy-commands:'.yellow+' Started refeshing (/) commands...'.italic.yellow);
        
        await rest.put(
            Routes.applicationGuildCommands('771986323007471616', '773723561390374973'),
            { body: commands }
        );

        console.log('deploy-commands:'.yellow+' Successfully reloaded (/) commands'.green);
    } catch (err) {
        console.error(err);
    }

})();