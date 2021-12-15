const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageAttachment, MessageActionRow, MessageSelectMenu } = require('discord.js');
const Rom = require('../../db/models/rom');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('getstuff')
        .setDescription('get a thing haha')
        .addStringOption(option => option.setName('query').setDescription('search for a thing').setRequired(true))
        ,
    execute: async (interaction) => {
        const query = interaction.options.getString('query');
        console.log(query);
        // const roms = await Rom.find({$text: {$search: query}});
        await Rom.search(query, async (err, data) => {
            if (data.length === 0 || typeof(data) === 'undefined' || err) {
                console.log('empty');
                return await interaction.reply({content: 'nothing found', ephemeral: true});
            } else {
                let ops = [];
                for (const [i, n] of data.entries()) {
                    if (i > 9) {
                        break;
                    }
                    ops.push({label: `${n.name} - ${n.category}`, value: n._id.toString()});
                }
                const row = new MessageActionRow()
                    .addComponents(
                        new MessageSelectMenu()
                            .setCustomId('select')
                            .setPlaceholder('select')
                            .addOptions(ops)
                    );
                // const file = new MessageAttachment('/home/garett/drive1/Roms/NEOGEO/neogeo.zip');
                await interaction.reply({content: "heres what i got for you", ephemeral: true, components: [row]});
                // await interaction.reply({content: "khjasdkjashdas", ephemeral: true, files: [file]});
            }
        });

    },
}