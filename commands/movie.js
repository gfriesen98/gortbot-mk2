const axios = require('axios');
const fs = require('fs');
const { downloadFile } = require('../utility/download');
const pfs = fs.promises;

function movie(DATA) {
    return {
        title: DATA.title, summary: DATA.summary,
        tagline: DATA.tagline, contentRating: DATA.contentRating,
        thumb: DATA.thumb, release: DATA.originallyAvailableAt,
        rating: DATA.rating, duration: DATA.duration, ratingKey: DATA.ratingKey
    }
}

function episode(DATA) {
    return {
        title: DATA.grandparentTitle, summary: DATA.summary,
        episode: DATA.title, season: DATA.parentTitle,
        thumb: DATA.parentThumb, release: DATA.originallyAvailableAt,
        rating: DATA.audienceRating, duration: DATA.duration, ratingKey: DATA.parentRatingKey
    }
}

function send(Metadata, TYPE, chat, filename) {
    if (TYPE === 'movie') {
        const embed = {
            title: `Now Playing ${Metadata.title}`,
            description: `*${Metadata.tagline}*\n${Metadata.summary}`,
            author: {
                name: 'Plex',
                icon_url: 'https://upload.wikimedia.org/wikipedia/commons/8/8e/Plex_favicon.png'
            },
            fields: [
                { name: 'Release', value: `${Metadata.release}` },
                { name: '\u200b', value: '\u200b', inline: false },
                { name: 'Rating', value: `${Metadata.rating}`, inline: true },
                { name: 'Duration', value: `${Metadata.duration}`, inline: true }
            ],
            image: {
                url: `attachment://${filename}`
            },
            timestamp: new Date(),
            footer: {
                text: `Rated ${Metadata.contentRating}`
            }
        };

        chat.send({ embeds: [embed], files: [`/tmp/gortbot/plex/img/${filename}`] });
    } else {
        const embed = {
            title: `Now Playing ${Metadata.title}`,
            description: `*${Metadata.episode}*\n${Metadata.summary}`,
            author: {
                name: 'Plex',
                icon_url: 'https://upload.wikimedia.org/wikipedia/commons/8/8e/Plex_favicon.png'
            },
            fields: [
                { name: 'Release', value: `${Metadata.release}` },
                { name: '\u200b', value: '\u200b', inline: false },
                { name: 'Rating', value: `${Metadata.rating}`, inline: true },
                { name: 'Duration', value: `${Metadata.duration}`, inline: true }
            ],
            image: {
                url: `attachment://${filename}`
            },
            timestamp: new Date(),
            footer: {
                text: `${Metadata.season}`
            }
        };

        console.log(filename);
        chat.send({ embeds: [embed], files: [`/tmp/gortbot/plex/img/${filename}`] });
    }
}

module.exports = {

    currentlyPlaying: async function (message, chat) {
        try {
            await pfs.access(`${process.env.PLEX_DIR}/currently-playing.json`);
        } catch (err) {
            console.error(err);
            console.error('nothing is currently playing');
            return message.channel.send('Nothing is playing');
        }

        const { Metadata: DATA, Player } = JSON.parse(await pfs.readFile(`${process.env.PLEX_DIR}/currently-playing.json`));
        if (Player.uuid !== process.env.PLEX_PLAYER_UUID) return null;

        const TYPE = DATA.type;
        const METADATA = TYPE === 'episode' ? episode(DATA) : movie(DATA);
        const PARAMS = `${METADATA.thumb}?X-Plex-Token=${process.env.PLEX_TOKEN}`;
        const FILENAME = `${
            METADATA.index+METADATA.title.replace(/ /g, '_').replace('/\'/g', '')
        }.jpg`;
        // const WRITER = fs.createWriteStream(`/tmp/gortbot/plex/img/${FILENAME}`);

        /**
         * @todo
         * For some reason, when an icon already exists it will not 
         * embed, but if an image does not exist and goes through the
         * download process, it works :/
         */
        try {
            await pfs.access(`/tmp/gortbot/plex/img/${FILENAME}`);
            console.log('file exists');
            send(METADATA, TYPE, chat, `/tmp/gortbot/plex/img/${FILENAME}`);
        } catch (err) {
            let url = process.env.PLEX_URL+PARAMS;
            downloadFile(url, '/tmp/gortbot/plex/img/'+FILENAME);
            send(METADATA, TYPE, chat, FILENAME);
        }

    }
}