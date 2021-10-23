const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('poop')
        .setDescription('hehe :)'),
    async execute(interaction) {
        await interaction.reply('ooouu!');
    }
}