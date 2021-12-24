const fs = require('fs');
const { initializeUser } = require('../utility/bouncer');
const { generateTeam, turn, calculateDamage } = require('../utility/pokemon');
const { getRandomInt, getBattleRandomNum } = require('../utility/math');
const { MessageAttachment } = require('discord.js');

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
        const user = await initializeUser(message.author.id, message.member.displayName);
        const content = message.content.split(" ");
        if (content.length < 3 || content.length > 3) 
            return message.channel.send(`g!battle [random|constructed] [1-6]`);
        if (user.success) {
            const type = content[1];
            const partyLength = content[2];
            if (partyLength > 6 || partyLength < 0) return message.channel.send('g!battle [random|constructed] [1-6]')
            console.log(type);
            switch (type) {
                case 'random':
                    const NAME = user.currentNickname;
                    const ENEMYNAME = "Bob";
                    const battleLog = [];
                    let playerTeam = await generateTeam(partyLength);
                    let enemyTeam = await generateTeam(partyLength);
                    let endBattle = false; //set to true when one teams party is wiped
                    let currentTurn = 1;

                    // main sim loop
                    while (!endBattle) {
                        let result = turn(playerTeam[0], enemyTeam[0], currentTurn, NAME, ENEMYNAME, 'none');
                        console.log(result);
                        battleLog.push(result.turnLog);
                        if (result.death.isDead) {
                            if (result.death.who == 'player') playerTeam.shift();
                            if (result.death.who == 'enemy') enemyTeam.shift();
                        }

                        if (playerTeam.length <= 0) {
                            battleLog.push(`${NAME} lost!`);
                            endBattle = true;
                        }

                        if (enemyTeam.length <= 0) {
                            battleLog.push(`${NAME} won!`);
                            endBattle = true;
                        }

                        if (typeof(result.playerHP) === 'undefined' && !result.death.isDead) {
                            // check for confustion/status attack here??
                            battleLog.push(`${NAME}'s pokemon took no damage!`);
                        } else {
                            playerTeam[0].stats[0].real_stat = result.playerHP;
                        }

                        if (typeof(result.enemyHP) === 'undefined' && !result.death.isDead) {
                            battleLog.push(`${ENEMYNAME}'s pokemon took no damage!`);
                        } else {
                            enemyTeam[0].stats[0].real_stat = result.enemyHP ;
                        }
                        currentTurn++;

                        if (currentTurn > 50) {
                            endBattle = true;
                        }
                    }
                    battleLog.push(`ENDING TURN: ${currentTurn}`);
                    let output = battleLog.flat().join('\n');
                    let filename = `/tmp/pokemon_logs/${NAME}-${Date.now()}.txt`;
                    fs.writeFile(filename, output, (err) => {
                        console.log(err);
                        return message.channel.send('error sending log');
                    });
                    let attachment = new MessageAttachment(filename, 'log.txt');
                    return message.channel.send({files: [attachment]});

                default:
                    return message.channel.send(`${type} is not valid`);

            }
        } else {
            return message.channel.send('error');
        }

    }
}