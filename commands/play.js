const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('play a song from youtube'),
    async execute(interaction) {
        await interaction.reply('ooouu!');
    }
}