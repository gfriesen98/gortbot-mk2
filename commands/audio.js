const ytdl = require('ytdl-core');
const {google} = require('googleapis');
const path = require('path');
const {authenticate} = require('@google-cloud/local-auth');
const youtube = google.youtube({version: 'v3', auth: process.env.GOOGLE});
const { getPreview } = require('spotify-url-info');
const { 
    joinVoiceChannel, AudioPlayerStatus, StreamType,
    createAudioPlayer, createAudioResource 
} = require('@discordjs/voice');

var q = [];
var connection = null;
var player = createAudioPlayer();

/**
 * 
 * @param {Object} message discord.js message object
 */
async function playSong(message) {
    console.log(q);
    //should go into its own function
    if (q[0].startsWith('https://open.spotify.com/') || q[0].startsWith('https://play.spotify.com/')) {
        const data = await getPreview(q[0]);
        console.log(data);
        //to yt url
        const youtubeSearch = await youtube.search.list({
            q: `${data.title} ${data.artist}`,
            part: 'id,snippet'
        });
        console.log(youtubeSearch);
        q[0] = `https://youtu.be/${youtubeSearch.data.items[0].id.videoId}`;
    }
    const stream = ytdl(q[0], {filter: 'audioonly'});
    const resource = createAudioResource(stream, {inputType: StreamType.Arbitrary});
    player.play(resource);
    message.channel.send('Playing Song');
}

module.exports = {
    setup: async (message, youtube) => {
        if (!message.member.voice) return message.channel.send("askjsdhjksdfhjksdf");
        const args = message.content.split(" ");
        console.log(args);

        if (q.length > 0) {
            q.push(args[1]);
            return message.channel.send('Added 2 Q');
        }

        if (q.length === 0) {
            var connectionOpts = {
                channelId: message.member.voice.channel.id,
                guildId: message.guild.id,
                adapterCreator: message.guild.voiceAdapterCreator
            };
            q.push(args[1]);
            connection = joinVoiceChannel(connectionOpts);
            connection.subscribe(player);
            playSong(message);
        }
        
        player.on(AudioPlayerStatus.Idle, () => {
            q.shift();
            if (q.length === 0) {
                connection.destroy();
            } else {
               playSong(message, youtube);
            }
        })
    },

    pause: async (message) => {
        player.pause();
        return message.channel.send('Paused');
    },

    stop: async (message) => {
        q.length = 0;
        player.stop();
        return message.channel.send('Stopped');
    },

    resume: async (message) => {
        player.unpause();
        return message.channel.send('Resuming playback');
    },

    skip: async (message) => {
        player.stop();
        return message.channel.send('Skipping');
    }
}