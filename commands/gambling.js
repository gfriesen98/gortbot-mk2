const { initializeUser } = require('../utility/bouncer');
const { generateTeam } = require('../utility/pokemon');

/**
 * @todo
 * It would be cool to make some kind of pokemon battle
 * simulator that gives the user a log of the battle
 */
module.exports = {

    /**
     * Displays the users points
     * @param {Object} message Discord message object
     * @returns Message
     */
    points: async function (message) {
        const user = await initializeUser(message.author.id);
        if (user.success) {
            return message.channel.send(`points: ${user.points}`);
        } else {
            return message.channel.send('error');
        }
    },

    /**
     * 
     * @param {Object} message Discord message object
     */
    battle: async function (message) {
        const user = await initializeUser(message.author.id);
        const content = message.content.split(" ");
        if (content.length < 3 || content.length > 3) 
            return message.channel.send(`g!battle [random|constructed] [1-6]`);
        if (user.success) {
            const type = content[1];
            const partyLength = content[2];
            if (partyLength > 5) return message.channel.send('g!battle [random|constructed] [1-6]')
            console.log(type);
            switch (type) {
                case 'random':
                    const playerTeam = await generateTeam(partyLength);
                    console.log(playerTeam);
            }
        } else {
            return message.channel.send('error');
        }

    }
}