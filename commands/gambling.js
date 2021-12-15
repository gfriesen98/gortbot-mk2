const User = require('../db/models/user');
const Axios = require('axios');
const pfs = require('fs/promises');
const { results: POKEMON, count } = require('../assets/pokemon.json');

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    const res = Math.floor(Math.random() * (max - min + 1)) + min
    return res;
}

/**
 * Checks if a channel user is in the database.
 * 
 * If the user is not in the database it will
 * create an entry.
 * 
 * @param {Number} uid Discord user id
 * @returns {success: Boolean, uid, points}
 */
async function initializeUser(uid) {
    try {
        const res = await User.findOne({ uid: uid });
        if (res === null) {
            throw new Error('No user found');
        } else {
            console.log('found user');
            const {uid, points} = res;
            return {success: true, uid, points};
        }
    } catch (err) {
        console.error(err);
        if (err.message !== 'No user found') return {success: false};
        const user = new User({ uid: uid });
        console.log('saving user');
        await user.save();
        return initializeUser(uid);
    }
}

async function generateTeam(partyLength) {
    const MAX = POKEMON.length;
    const idxArray = [...Array(Number(partyLength)).keys()].map(n => {
        return getRandomInt(0, MAX);
    });
    let team = [];

    for (const i in idxArray) {
        const res = await Axios.get(POKEMON[i].url);
        const moves = res.data.moves;
        const m = [];
        for (let i = 0; i < moves.length; i++) {
            m.push(moves[getRandomInt(0, moves.length)]);
        }
        console.log(m);
        const pokedata = {
            name: res.data.name,
            types: 
                res.data.types.length === 1 ?
                    [res.data.types[0].type.name]
                :   [res.data.types[0].type.name, res.data.types[1].name],
            
        }
    }
}

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
                    const playerTeam = generateTeam(partyLength);
            }
        } else {
            return message.channel.send('error');
        }

    }
}