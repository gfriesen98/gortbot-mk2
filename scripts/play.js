const { SlashCommandBuilder } = require('@discordjs/builders');
const ytdl = require('ytdl-core');
const { 
    joinVoiceChannel, AudioPlayerStatus, StreamType,
    createAudioPlayer, createAudioResource 
} = require('@discordjs/voice');
var q = ['https://youtu.be/sUzIeTCBtjg', 'https://youtu.be/Rj-h7ktkteY'];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('play a song from youtube'),
    execute: async (interaction) => {
        const channel = interaction.member.voice.channel;

        if (!channel) return await interaction.reply('fuck you');

        const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator
        });

        const player = createAudioPlayer();
        connection.subscribe(player);        

        await interaction.reply('ooouu!');
        module.exports.execute(interaction, player );

        player.on(AudioPlayerStatus.Idle, () =>  { 
            q.shift();
            if (q.length === 0) {
                connection.destroy();
            } else {
                module.exports.execute(interaction);
            }
        });
    },
    playNext: async (interaction, player) => {
        const stream = ytdl(q[0], { filter: 'audioonly' });
        const resource = createAudioResource(stream, {inputType: StreamType.Arbitrary});
        player.play(resource);
        await interaction.followUp();
    }
}