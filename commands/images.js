const { initializeUser } = require("../utility/bouncer");
const { getFileSize } = require('../utility/math');
const { downloadFile } = require('../utility/download');
const Image = require('../db/models/images');
const IMAGE_DIR = process.env.IMAGES;

module.exports = {
    giveme: async function (message) {
        const user = await initializeUser(message.author.id, message.member.displayName);
        if (user.success === false) return message.channel.send('Error :)');
        if (message.attachments.size <= 0) return message.channel.send('Error :)');
        const attachment = Array.from(message.attachments.values())[0];
        const filesize = getFileSize(attachment.size);

        let res = downloadFile(attachment.url, IMAGE_DIR+attachment.name);

        const image = new Image({
            name: attachment.name,
            path: res ? IMAGE_DIR+attachment.name : attachment.url,
            filesize: filesize
        });

        try {
            await image.save();
            return message.channel.send('Thank your for your donation');
        } catch (err) {
            console.error(err);
            return message.channel.send('Error :)');
        }
    },

    meme: async function (message) {
        Image.random(function(err, image) {
            if (err) return message.channel.send('error :)');
            console.log(image);
            if (image.path.startsWith('https://')) {
                return message.channel.send({ embeds: [{ image: { url: image.path } }] });
            } else {
                return message.channel.send({ files: [{ attachment: image.path }] })
            }
        })
    }
}