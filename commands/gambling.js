const { initializeUser } = require('../utility/bouncer');
const { generateTeam, turn, calculateDamage } = require('../utility/pokemon');
const { getRandomInt } = require('../utility/randomizers');

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
            if (partyLength > 6 || partyLength < 1) return message.channel.send('g!battle [random|constructed] [1-6]')
            console.log(type);
            switch (type) {
                case 'random':
                    const playerName = user.currentNickname;
                    const playerTeam = await generateTeam(partyLength);
                    const enemyTeam = await generateTeam(partyLength);
                    const battleLog = [];
                    let endBattle = false; //set to true when one teams party is wiped
                    // main sim loop
                    while (!endBattle) {
                        let currentPlayerMon = playerTeam[0];
                        let currentEnemyMon = enemyTeam[0];
                        let currentHP = currentPlayerMon.stats[0].real_stat;
                        let EcurrentHP = currentEnemyMon.stats[0].real_stat;
                        battleLog.push(`${playerName} brought out ${currentPlayerMon.name}!`);
                        battleLog.push(`Bill brought out ${enemyTeam[0].name}!`);
                        battleLog.push(`(You) ${currentPlayerMon.name} HP: ${currentPlayerMon.stats[0].real_stat}`);
                        currentPlayerMon.stats.forEach(n => {
                            battleLog.push(`(You) ${n.name}: ${n.real_stat} | base: ${n.base_stat}`);
                        })
                        battleLog.push(`(Bill) ${currentEnemyMon.name} HP: ${currentEnemyMon.stats[0].real_stat}`);
                        currentEnemyMon.stats.forEach(n => {
                            battleLog.push(`(You) ${n.name}: ${n.real_stat} | base: ${n.base_stat}`);
                        })

                        let playerMove = currentPlayerMon.moveset[getRandomInt(0, currentPlayerMon.moveset.length-1)];
                        battleLog.push(`${currentPlayerMon.name} used ${playerMove.name}`);
                        let playerDmg = calculateDamage(
                            currentPlayerMon.level, playerMove.power, 
                            currentPlayerMon.stats[1].real_stat, currentEnemyMon.stats[2].real_stat,
                            1, 1, 1, 0.85, 1, 1, 1, 1
                        );
                        battleLog.push(`${currentPlayerMon.name} delt ${playerDmg} damage to ${currentEnemyMon.name}!`);
                        EcurrentHP = EcurrentHP - playerDmg;
                        battleLog.push(`${currentEnemyMon.name} HP: ${EcurrentHP}`);

                        endBattle = true;
                    }

                    console.log(battleLog);
            }
        } else {
            return message.channel.send('error');
        }

    }
}