const User = require('../db/models/user');

module.exports = {
    /**
     * Checks if a channel user is in the database.
     * 
     * If the user is not in the database it will
     * create an entry.
     * 
     * @param {Number} uid Discord user id
     * @returns {success: Boolean, uid, points}
     */
    initializeUser: async function (uid) {
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
            return this.initializeUser(uid);
        }
    }
}