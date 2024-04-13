const passport = require("passport");
const localStrategy = require("passport-local");

import { User } from "../Models/User";

passport.use(new localStrategy(async (email: any, password: any, cb: any) => {
    const u: User | null = (await User.findAll({
        where: {
            email: email
        }
    }))[0];
    if (u === null) {
        return cb(null, false);
    }
    if (!u.checkPassword(password)) {
        return cb(null, false);
    }
    return cb(null, u);
}));

passport.serializeUser((user: any, cb: any) => {
    return cb(null, {
        id: user.id,
        username: user.username
    });
});

passport.deserializeUser(async (user: any, cb: any) => {
    const u: User | null = (await User.findAll({
        where: {
            id: user.id
        }
    }))[0];
    if (u === null) {
        return cb(new Error("User not found"));
    }
    return cb(null, u);
});

module.exports = passport;