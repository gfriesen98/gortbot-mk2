const ytdl = require('ytdl-core');
const {MessageEmbed} = require('discord.js');
const youtube = require('scrape-youtube').default;
const { getPreview, getTracks, getData: spotifyData } = require('spotify-url-info');
const { 
    joinVoiceChannel, AudioPlayerStatus, StreamType,
    createAudioPlayer, createAudioResource 
} = require('@discordjs/voice');

var q = [];
var connection = null;
var player = createAudioPlayer();

/**
 * Grabs metadata from a spotify or youtube URL
 * @param {String} url requested URL
 * @param {String} requester username of the requester
 * @returns Messages to channel
 */
async function getData(url, requester, message) {

    // Check if incoming URL is a spotify URL
    if (url.startsWith('https://open.spotify.com/track') || url.startsWith('https://play.spotify.com/track')) {
        try {
            // Get metadata from spotify
            const data = await getPreview(url);
            // Get youtube video details based off spotify metadata
            const youtubeSearch = await youtube.search(`${data.title} - ${data.artist} Audio`);
            if (youtubeSearch.videos.length === 0) throw new Error('No videos found');
            // Return queue object
            return {
                URL: youtubeSearch.videos[0].link,
                title: data.title,
                imgURL: data.image,
                id: youtubeSearch.videos[0].id,
                requester: requester
            }
        } catch (err) {
            console.error(err);
            message.channel.send('Error getting video details FUCK');
        }

    // Check if incoming URL is a spotify playlist URL
    } else if (url.startsWith('https://open.spotify.com/playlist')) {
        try {
            // Get track metadata from spotify playlist URL
            const data = await getTracks(url);
            var toAdd = [];
            // Loop through array of tracks returned from spotify
            for (const n of data) {
                const spotifyURL = n.external_urls.spotify;
                const artist = n.artists[0].name;
                const title = n.name
                // Grab the image URL from spotify
                const imgURL = await getPreview(spotifyURL);
                // Get youtube video details based off spotify metadata
                const youtubeSearch = await youtube.search(`${title} - ${artist} Audio`);
                toAdd.push({
                    URL: youtubeSearch.videos[0].link,
                    title: title,
                    imgURL: imgURL.image,
                    id: youtubeSearch.videos[0].id,
                    requester: requester
                });
            }
            // Return array of queue objects to append
            return toAdd;
        } catch (err) {
            console.error(err);
            message.channel.send('Error getting video details FUCK');
        }
    
    } else if (url.startsWith('https://open.spotify.com/album')) {
        const data = await spotifyData(url);
        const albumURL = data.external_urls.spotify;
        const albumImgURL = data.images[0].url;
        const albumName = data.name;
        const artistName = data.artists[0].name;
        const totalTracks = data.total_tracks;
        var toAdd = [];
        for (n of data.tracks.items) {
            const spotifyURL = n.external_urls.spotify;
            const title = n.name;
            const youtubeSearch = await youtube.search(`${title} - ${albumName} - ${artistName}`);
            console.log(youtubeSearch);
            toAdd.push({
                URL: youtubeSearch.videos[0].link,
                title: title,
                imgURL: albumImgURL,
                id: youtubeSearch.videos[0].id,
                requester: requester
            });
        }

        return toAdd;

    // Else, should be a youtube URL
    } else {
        try {
            if (!url.startsWith('https://')) throw new Error('Not a valid URL');
            // Get youtube video metadata
            const data = await ytdl.getInfo(url);
            // Return queue object
            return {
                URL: data.videoDetails.video_url,
                title: data.videoDetails.title,
                imgURL: `https://i.ytimg.com/vi/${data.videoDetails.videoId}/hqdefault.jpg`,
                id: data.videoDetails.videoId,
                requester: requester
            }
        } catch (err) {
            console.error(err);
            message.channel.send('Error getting video details FUCK');
        }
    }
}

/**
 * Plays an audio resource from the queue
 * @param {Object} message discord.js message object
 */
async function playSong(message) {
    try {
        //Grab data stream from URL and set up an audio resource
        const stream = ytdl(q[0].URL, {filter: 'audioonly'});
        const resource = createAudioResource(stream, {inputType: StreamType.Arbitrary});

        //Start playback
        player.play(resource);
        let messageEmbed = new MessageEmbed()
            .setColor('#0dac4e')
            .setTitle(`▶️ Now Playing: ${q[0].title}`)
            .setURL(q[0].URL.toString())
            .addField(`Requested By: `, q[0].requester.toString())
            .setThumbnail(q[0].imgURL);
        return message.channel.send({embeds: [messageEmbed]});
    } catch (err) {
        console.error(err);
        return message.channel.send('Could not play current song. Trying again...');
    }
}

module.exports = {

    /**
     * Sets up bot for audio playback
     * When a user is in a voice channel, the bot will join the
     * voice channel and add requested song to a queue.
     * 
     * Calling this method again will just add a song to the queue!
     * 
     * @param {Object} message discord.js message object
     * @returns Message to channel
     */
    setup: async (message) => {
        const args = message.content.split(" ");
        if (!message.member.voice.channel) return message.channel.send("You need to be in a voice channel there bud.");
        if (!args[1].startsWith('https://')) return message.channel.send("You are so small. Such a small and worthless being. Tiny, tiny man. Tiny man must give me a valid URL to proceed...");

        // If queue length exists, append request to queue and exit
        if (q.length > 0) {
            const data = await getData(args[1], message.member.nickname, message);

            // If playlist, append array items to queue array
            if (Array.isArray(data)) {
                var count = data.length;
                q = [...q, ...data];
                let messageEmbed = new MessageEmbed()
                    .setColor('#e08a00')
                    .setTitle(`🎧 ${count} songs added to the queue`)
                    .addField('Requested By: ', data[0].requester)
                    .setThumbnail(data[0].imgURL)
                return message.channel.send({embeds: [messageEmbed]});

            // If not playlist, append item to queue array
            } else {
                q.push(data);
                let queuePosition = q.indexOf(data) + 1;
                let messageEmbed = new MessageEmbed()
                    .setColor('#e08a00')
                    .setTitle(`🎧 ${data.title} added to the queue`)
                    .setDescription(`Position in queue: ${queuePosition}`)
                    .setURL(data.URL)
                    .addField(`Requested By: `, data.requester)
                    .setThumbnail(data.imgURL);
                return message.channel.send({embeds: [messageEmbed]});
            }
        }

        // If queue does not exist, append request to queue and start audio connection setup
        if (q.length === 0) {
            var connectionOpts = {
                channelId: message.member.voice.channel.id,
                guildId: message.guild.id,
                adapterCreator: message.guild.voiceAdapterCreator
            };
            const data = await getData(args[1], message.member.nickname, message);

            // If playlist, append array items to queue array
            if (Array.isArray(data)) {
                var count = data.length;
                q = [...data];
                let messageEmbed = new MessageEmbed()
                    .setColor('#e08a00')
                    .setTitle(`🎧 ${count} songs added to the queue`)
                    .addField('Requested By: ', data[0].requester)
                    .setThumbnail(data[0].imgURL)
                message.channel.send({embeds: [messageEmbed]});

            // If not playlist, append item to queue array
            } else {
                q.push(data);
            }

            // Connect to voice channel
            connection = joinVoiceChannel(connectionOpts);
            connection.subscribe(player);
            playSong(message);
        }
        
        // Set up event listener to watch for idle state
        player.on(AudioPlayerStatus.Idle, () => {
            // Check if there are still songs in the queue
            // If no queue, destroy connection, otherwise shift the array and call playSong()
            if (q.length === 0) {
                connection.destroy();
            } else {
                q.shift();
                playSong(message);
            }
        })
    },

    /**
     * Pauses audio playback
     * @param {Object} message discord.js message object
     * @returns Messages channel
     */
    pause: async (message) => {
        player.pause();
        return message.channel.send('Paused');
    },

    /**
     * Stops audio playback and clears the queue
     * @param {Object} message discord.js message object
     * @returns Messages channel
     */
    stop: async (message) => {
        q.length = 0;
        player.stop();
        return message.channel.send('Stopped');
    },

    /**
     * Resumes playback
     * @param {Object} message discord.js message object
     * @returns Messages channel
     */
    resume: async (message) => {
        player.unpause();
        return message.channel.send('Resuming playback');
    },

    /**
     * Skips the currently playing song
     * @param {Object} message discord.js message object
     * @returns Messages channel
     */
    skip: async (message) => {
        player.stop();
        return message.channel.send('Skipping');
    },

    /**
     * Messages channel with the song next in the queue
     * @param {Object} message discord.js message object
     * @returns Messages channel
     */
    next: async (message) => {
        const nextUp = q[1] ? q[1] : q[0];
        let messageEmbed = new MessageEmbed()
            .setColor('#0dac4e')
            .setTitle(`🎵 Up Next: ${nextUp.title}`)
            .setURL(nextUp.URL)
            .addField(`Requested By: `, nextUp.requester)
            .setThumbnail(nextUp.imgURL);
        
        return message.channel.send({embeds: [messageEmbed]});
    },

    inQueue: async (message) => {
        if (message.content.endsWith('g!inq')) return message.channel.send('Provide me sustinence (search terms)');
        const query = message.content.replace('g!inq ', '').split(' ');
        const queueTitles = q.map((n, i) => {
            return {
                title: n.title,
                words: n.title.split(' ').map(m => {m = m.replace(/[^\w\s]/gi, ''); return m.toLowerCase()}),
                wordLetters: n.title.split(' ').map(m => {
                    m = m.replace(/[^\w\s]/gi, '').toLowerCase();
                    return m.split('');
                }),
                queueIndex: i
            };
        });

        const results = queueTitles.map(n => {
            var matchingWordIdx = 0;
            var matchingLetterIdx = 0;
            var totalLetters = 0;
            for (const m of query) {
                n.words.forEach(w => {
                    console.log('m',m);
                    console.log('w', w);
                    if (m === w) {
                        matchingWordIdx++;
                    } else {
                        console.log('else');
                        const qSplit = m.split('');
                        for (const p of n.wordLetters){
                            totalLetters+=p.length;
                            for(const g of qSplit) {
                                if (g === p) {
                                    matchingLetterIdx++;
                                }
                            }
                        }
                    }
                });
                console.log('letters: ',matchingLetterIdx);
                console.log('words: ',matchingWordIdx);
                return {
                    matchingWordIdx: (matchingWordIdx/n.words.length)*100,
                    matchingLetterIdx: (matchingLetterIdx/totalLetters)*100,
                    searchQuery: query.join(" "),
                    bestMatch: queueTitles[n.queueIndex]
                }
            }
        });
        console.log(results);

    },
}