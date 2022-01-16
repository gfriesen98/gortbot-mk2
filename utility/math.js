module.exports = {

    /**
     * Generates a random integer from a range between integers
     * @param {int} min Minimum
     * @param {int} max Maximum
     * @returns {int} Random Integer between Min and Max
     */
    getRandomInt: function (min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        const res = Math.floor(Math.random() * (max - min + 1)) + min
        return res;
    },

    /**
     * Generates a number between 0.85 and 1 for battle
     * @returns Number between 0.85 and 1
     */
    getBattleRandomNum: function () {
        let min = 0.85;
        let max = 1;
        const res = (Math.random() * (max - min) + min).toFixed(2);
        return res;
    },

    /**
     * Calculates the damage delt to the target pokemon
     * 
     * @param {number} Level Pokemons level
     * @param {number} Power Move Power
     * @param {number} A     Attacking Pokemons Attack
     * @param {number} D     Target Pokemons Defense
     * @param {number} Targets Number of Targets
     * @param {number} Weather Weather Multiplier
     * @param {number} Critical Critical Hit Multiplier
     * @param {number} random Random multiplier
     * @param {number} STAB Same Type Attack Bonus
     * @param {number} Type Type Effectiveness Multiplier
     * @param {number} Burn Burn Multiplier
     * @param {number} other Other (stacked) Effects
     * @returns {number} Damage delt to target pokemon
     */
    calculateDamage(Level, Power, A, D, Targets, Weather, Critical, random, STAB, Type, Burn, other) {
        let bracket1 = (2 * Level) / 5;
        let bracket2 = ((bracket1 + 2) * Power * (A / D) / 50) + 2;
        // let brackets = 2 + (((2 + (Level*2)/5)*Power*(A/D))/5);
        return bracket2 * Targets * Weather * Critical * random * STAB * Type * Burn * other;
    },

    /**
     * Returns human readable file size from bytes
     * 
     * @param {string} filesize file size from discord message attachment
     * @returns stringified file size
     */
    getFileSize(filesize) {
        var i = Math.floor(Math.log(filesize) / Math.log(1024));
        return ((filesize / Math.pow(1024, i).toFixed(2) * 1).toFixed(2) + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i]);
      }
}