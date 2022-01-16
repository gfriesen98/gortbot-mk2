const Grievance = require('../db/models/grievance');
const { initializeUser } = require('../utility/bouncer');

const words = [
    'fuck', 'fucking', 'shit', 'asshole', 'boss', 'my boss', 'work', 'sucks', 'im going to kill',
    'shoot', 'k*ll', 'kill', 'coworker', 'coworkers', 'hate', 'drat', 'piss', 'pissed', 'angry', 'darn',
    'suicide', 'murder', 'office'
];

module.exports = {
    post: async function (message) {
        const user = await initializeUser(message.author.id, message.member.displayName);
        if (user.success === false) return message.channel.send('Error :)');

        const content = message.content.substring("g!grieve".length).trim();



        const grievance = new Grievance({user: user._id, content: content});

        try {
            await grievance.save();
            const embed = {
                title: `${user.currentNickname}'s Prognosis`,
            }
            // @todo
            return null;
        } catch (err) {
            console.error(err);
            return message.channel.send('Error :)');
        }

    }
}