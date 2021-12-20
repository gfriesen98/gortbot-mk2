const User = require('../db/models/user');

var obj = {
    /**
     * Checks if a channel user is in the database.
     * 
     * If the user is not in the database it will
     * create an entry.
     * 
     * @param {Number} uid Discord user id
     * @returns {success: Boolean, uid, points}
     */
    initializeUser: async function (uid, nickname) {
        try {
            const res = await User.findOne({ uid: uid });
            if (res === null) {
                throw new Error('No user found');
            } else {
                console.log('found user');
                let {uid, points, currentNickname} = res;
                if (currentNickname !== nickname) {
                    await User.findOneAndUpdate({ uid: uid}, { currentNickname: nickname });
                    currentNickname = nickname;
                }
                return {success: true, uid, points, currentNickname};
            }
        } catch (err) {
            console.error(err);
            if (err.message !== 'No user found') return {success: false};
            const user = new User({ uid: uid, currentNickname: nickname });
            console.log('saving user');
            await user.save();
            return obj.initializeUser(uid);
        }
    },

    saveTeam: async function (uid, team) {
        try {
            await User.findOneAndUpdate({ uid: uid }, {
                $push: { $push: {team: {$each: team}}}
            });

        } catch (err) {
            console.error(err);
            return { success: false }
        }
    }
}

module.exports = obj;